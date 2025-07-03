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

// Generate unique organization code
const generateOrgCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, organizationCode, isIndependentAgent } = req.body;
  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
  }
  
  // Validate tenant requirements
  if (role === 'Tenant' && !organizationCode) {
    return res.status(400).json({ success: false, message: 'Organization code is required for tenant signup' });
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
    
    let organization;
    let user;
    
    if (role === 'Tenant' || (role === 'Agent' && organizationCode)) {
      // Join existing organization
      organization = await Organization.findOne({ organizationCode });
      if (!organization) {
        return res.status(400).json({ success: false, message: 'Invalid organization code' });
      }
      
      user = new User({ 
        name, 
        email, 
        password, 
        role, 
        organizationId: organization._id,
        isEmailVerified: false
      });
      
      organization.members.push(user._id as Types.ObjectId);
      await organization.save();
    } else {
      // Create new organization (Landlord or Independent Agent)
      const trialPlan = await Plan.findOne({ name: 'Free Trial' });
      if (!trialPlan) {
          return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
      }
      
      let orgCode;
      do {
        orgCode = generateOrgCode();
      } while (await Organization.findOne({ organizationCode: orgCode }));
      
      organization = new Organization({ 
        name: `${name}'s Organization`, 
        members: [],
        organizationCode: orgCode
      });
      
      user = new User({ 
        name, 
        email, 
        password, 
        role, 
        organizationId: organization._id,
        isIndependentAgent: role === 'Agent' && isIndependentAgent,
        isEmailVerified: false
      });
      
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
      await subscription.save();
    }
    
    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await emailService.sendEmail(
        user.email,
        'Verify Your Email Address',
        'emailVerification',
        { userName: user.name, verificationUrl }
      );
      
      // Send welcome email
      try {
        await emailService.sendEmail(
          user.email,
          'Welcome to HNV Property Management!',
          'welcome',
          {
            name: user.name,
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
          }
        );
      } catch (welcomeError) {
        console.error('Welcome email failed:', welcomeError);
      }
      
      res.status(201).json({ 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account.' 
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still allow registration but inform user
      res.status(201).json({ 
        success: true, 
        message: 'Registration successful! Email verification temporarily unavailable - you can log in directly.' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password',
                code: 'MISSING_CREDENTIALS'
            });
        }
        
        // Find user with password field

        const user = await User.findOne({ email }).select('+password');
        if (!user) {

            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check if user account is suspended
        if (user.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account has been suspended. Please contact support.',
                code: 'ACCOUNT_SUSPENDED'
            });
        }

        // Check email verification
        if (!user.isEmailVerified) {
            return res.status(401).json({ 
                success: false, 
                message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }

        // Record login audit
        try {
            auditService.recordAction(
                user._id as Types.ObjectId,
                user.organizationId as Types.ObjectId,
                'USER_LOGIN',
                { loginTime: new Date(), userAgent: req.get('User-Agent') }
            );
        } catch (auditError) {
            console.warn('Audit logging failed:', auditError);
        }
        
        await sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login. Please try again.',
            code: 'SERVER_ERROR'
        });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // These properties now exist on the User model
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification token. Please try registering again.' });
    }

    // These properties now exist on the user object
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
            select: 'planId status trialExpiresAt currentPeriodEndsAt',
            populate: {
                path: 'planId',
                model: 'Plan',
                select: 'name price duration features limits'
            }
        }
    });
    res.status(200).json({ success: true, data: user });
};

export const googleAuthCallback = (req: Request, res: Response) => {
    if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google-auth-failed`);
    }
    const token = (req.user as IUser).getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?token=${token}`);
};

export const resendVerification = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }
        
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
        await emailService.sendEmail(user.email, 'Verify Your Email Address', 'emailVerification', {
            userName: user.name,
            verificationUrl: verificationUrl
        });
        
        res.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: 'Failed to resend verification email' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, profilePicture } = req.body;
        
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        auditService.recordAction(
            user._id as Types.ObjectId,
            user.organizationId as Types.ObjectId,
            'PROFILE_UPDATE',
            { updatedFields: Object.keys(req.body) }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update profile' 
        });
    }
};
