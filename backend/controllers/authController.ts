import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import mongoose, { Types } from 'mongoose';

// This helper function was missing from the broken file
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
        await emailService.sendEmail(
          user.email, 
          'Welcome to HNV Property Solutions!', 
          'welcome', 
          {
            userName: user.name,
            loginUrl: 'https://hnv-1-frontend.onrender.com/login'
          }
        );
    } catch (emailError) {
        console.error("Failed to send welcome email, but user was registered successfully:", emailError);
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
    auditService.recordAction(
        user._id as Types.ObjectId,
        user.organizationId as Types.ObjectId,
        'USER_LOGIN'
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
