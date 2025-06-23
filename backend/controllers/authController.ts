import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { IUser } from '../models/User';
import mongoose, { Types } from 'mongoose'; 

// FIX: This function will now send all the data the frontend expects.
const sendTokenResponse = async (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();

    // Get the user's subscription status to send to the frontend
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
        userStatus: subscription?.status || 'inactive' // Send subscription status
    });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
      return;
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User with that email already exists' });
      return;
    }
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
        res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
        return;
    }
    const organization = new Organization({ name: `${name}'s Organization`, members: [] });
    const user = new User({ name, email, password, role, organizationId: organization._id });
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
    await user.save();
    await subscription.save();
    
    auditService.recordAction(
        user._id as Types.ObjectId,
        organization._id as Types.ObjectId,
        'USER_REGISTER',
        { registeredUserId: (user._id as Types.ObjectId).toString() } 
    );
    try {
        await emailService.sendEmail(user.email, 'Welcome to HNV!', 'customMessage', { senderName: 'HNV', messageBody: '<h1>Welcome!</h1><p>Your 7-day free trial has started.</p>'});
    } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
    }
    await sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
    }
    auditService.recordAction(
        user._id as Types.ObjectId,
        user.organizationId as Types.ObjectId,
        'USER_LOGIN',
        {}
    );
    await sendTokenResponse(user, 200, res);
};

export const getMe = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const user = await User.findById(req.user._id).populate({
        path: 'organizationId',
        select: 'name status subscription',
        populate: {
            path: 'subscription',
            model: 'Subscription',
            select: 'planId status trialExpiresAt currentPeriodEndsAt'
        }
    });
    res.status(200).json({ success: true, data: user });
};

// FIX: This function now correctly generates a token and redirects to the frontend.
export const googleAuthCallback = (req: Request, res: Response) => {
    if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
    }
    const token = (req.user as IUser).getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
};
