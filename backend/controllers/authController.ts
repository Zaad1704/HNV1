// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { AuthenticatedRequest } => '../middleware/authMiddleware'; // FIX: Import AuthenticatedRequest
import { IUser } from '../models/User';
import mongoose, { Types } from 'mongoose'; // FIX: Import 'Types' for mongoose.Types.ObjectId
import passport from 'passport'; // FIX: Import passport for googleAuthCallback

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
  }
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with that email already exists' });
    }
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
        return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
    }
    const organization = new Organization({ name: `${name}'s Organization`, members: [] });
    const user = new User({ name, email, password, role, organizationId: organization._id });
    organization.owner = user._id as Types.ObjectId; // FIX: Use Types.ObjectId for casting
    organization.members.push(user._id as Types.ObjectId); // FIX: Use Types.ObjectId for casting
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const subscription = new Subscription({
        organizationId: organization._id as Types.ObjectId, // FIX: Use Types.ObjectId for casting
        planId: trialPlan._id as Types.ObjectId, // FIX: Use Types.ObjectId for casting
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });
    organization.subscription = subscription._id as Types.ObjectId; // FIX: Use Types.ObjectId for casting
    await organization.save();
    await user.save();
    await subscription.save();
    // FIX: Use Types.ObjectId for casting before .toString() and ensure 4 arguments for auditService
    auditService.recordAction(
        user._id as Types.ObjectId,
        organization._id as Types.ObjectId,
        'USER_REGISTER',
        { registeredUserId: (user._id as Types.ObjectId).toString() } // Pass empty object for details if none
    );
    try {
        await emailService.sendEmail(user.email, 'Welcome to HNV!', `<h1>Welcome!</h1><p>Your 7-day free trial has started.</p>`);
    } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
    }
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // FIX: Use Types.ObjectId for casting and ensure 4 arguments for auditService
    auditService.recordAction(
        user._id as Types.ObjectId,
        user.organizationId as Types.ObjectId,
        'USER_LOGIN',
        {} // Pass empty object for details
    );
    sendTokenResponse(user, 200, res);
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = await User.findById(req.user.id).populate({
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

// FIX: Placeholder for Google OAuth callback as requested by routes/authRoutes.ts
export const googleAuthCallback = (req: Request, res: Response) => {
  // This function will be called after Google authenticates the user.
  // The actual user data would be available in req.user from Passport.
  // You would typically redirect to your frontend dashboard from here.
  res.redirect('/dashboard'); // Example redirect
};
