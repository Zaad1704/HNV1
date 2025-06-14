// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan'; // <-- Import Plan model
import Subscription from '../models/Subscription'; // <-- Import Subscription model
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
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

    // --- New Subscription Logic ---
    // 1. Find the default trial plan from the database.
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) {
        return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
    }

    // 2. Create the Organization and User first to get their IDs.
    const organization = new Organization({ name: `${name}'s Organization`, members: [] });
    const user = new User({ name, email, password, role, organizationId: organization._id });
    organization.owner = user._id;
    organization.members.push(user._id);

    // 3. Create the 7-day trial subscription.
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const subscription = new Subscription({
        organizationId: organization._id,
        planId: trialPlan._id,
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });

    // 4. Update the organization with the new subscription ID.
    organization.subscription = subscription._id;

    // 5. Save everything to the database.
    await organization.save();
    await user.save();
    await subscription.save();

    auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
    
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
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    auditService.recordAction(user._id, user.organizationId, 'USER_LOGIN');
    sendTokenResponse(user, 200, res);
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => { 
    // In a real app, you might want to populate more user details here
    const user = await User.findById(req.user!.id).populate({
        path: 'organizationId',
        select: 'name status subscription',
        populate: {
            path: 'subscription',
            select: 'planId status trialExpiresAt currentPeriodEndsAt'
        }
    });
    res.status(200).json({ success: true, data: user }); 
};
