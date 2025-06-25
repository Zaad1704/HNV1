import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { IUser } from '../models/User';
import mongoose, { Types } from 'mongoose';
import crypto from 'crypto';

// This helper function creates and sends the JWT response
const sendTokenResponse = async (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    const subscription = await Subscription.findOne({ organizationId: user.organizationId });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        userStatus: subscription?.status || 'inactive'
    });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If user exists but is not verified, we can resend verification.
      if (!userExists.isEmailVerified) {
          // You could add logic here to resend the verification email if desired.
          return res.status(400).json({ success: false, message: 'This email is already registered but not verified. Please check your inbox.' });
      }
      return res.status(400).json({ success: false, message: 'User with that email already exists' });
    }
    
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
        return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
    }
    
    const organization = new Organization({ name: `${name}'s Organization`, members: [] });
    
    const user = new User({ 
        name, 
        email, 
        password, 
        role, 
        organizationId: organization._id,
        isEmailVerified: false // User starts as unverified
    });

    const verificationToken = user.getEmailVerificationToken();
    
    organization.owner = user._id as Types.ObjectId; 
    organization.members.push(user._id as Types.ObjectId); 
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const subscription = new Subscription({
        organizationId: organization._id as Types.ObjectId, 
        planId: trialPlan._id as Types.ObjectId, 
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });
    organization.subscription = subscription._id as Types.ObjectId; 
    
    await organization.save();
    await user.save({ validateBeforeSave: false }); // Save user with verification token
    await subscription.save();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    try {
        await emailService.sendEmail(user.email, 'Verify Your Email Address', 'emailVerification', {
            userName: user.name,
            verificationUrl: verificationUrl
        });
        res.status(201).json({ success: true, message: 'Registration successful! Please check your email to verify your account.' });
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // This is a critical failure point. In a production system, you might add the user to a re-verification queue.
        return res.status(500).json({ success: false, message: 'User registered, but failed to send verification email.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email address before logging in.' });
    }

    auditService.recordAction(
        user._id as Types.ObjectId,
        user.organizationId as Types.ObjectId,
        'USER_LOGIN',
        {}
    );
    await sendTokenResponse(user, 200, res);
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification token. Please try registering again.' });
    }

    user.isEmailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
};

export const getMe = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = await User.findById(req.user._id).populate({
        path: 'organizationId',
        select: 'name status subscription branding',
        populate: {
            path: 'subscription',
            model: 'Subscription',
            select: 'planId status trialExpiresAt currentPeriodEndsAt'
        }
    });
    res.status(200).json({ success: true, data: user });
};

export const googleAuthCallback = (req: Request, res: Response) => {
    if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
    }
    const token = (req.user as IUser).getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
};
