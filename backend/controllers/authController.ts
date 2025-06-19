import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import auditService from '../services/auditService';
import mongoose, { Types } from 'mongoose'; // Use Types

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }
  if (role === 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Cannot register a Super Admin account.' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User with that email already exists' });
    
    const trialPlan = await Plan.findOne({ name: 'Free Trial' });
    if (!trialPlan) return res.status(500).json({ success: false, message: 'Trial plan not configured.' });
    
    const organization = new Organization({ name: `${name}'s Organization` });
    
    const user = new User({ name, email, password, role, organizationId: organization._id });
    
    organization.owner = user._id;
    organization.members.push(user._id);

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const subscription = new Subscription({
        organizationId: organization._id,
        planId: trialPlan._id,
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });
    
    organization.subscription = subscription._id;
    
    await organization.save();
    await user.save();
    await subscription.save();
    
    // Pass correct ObjectId type
    auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        console.error(`Login failed: User not found for email ${email}`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        // Pass correct ObjectId type
        auditService.recordAction(user._id, user.organizationId, 'LOGIN_FAILURE', { reason: 'Incorrect password' });
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Pass correct ObjectId type
    auditService.recordAction(user._id, user.organizationId, 'USER_LOGIN', {});
    sendTokenResponse(user, 200, res);
};

export const getMe = async (req: Request, res: Response) => { 
    if (!req.user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Use req.user._id instead of req.user.id
    const fullUserData = await User.findById(req.user._id).populate({
        path: 'organizationId',
        select: 'name status subscription',
        populate: { path: 'subscription', model: 'Subscription' }
    });
    res.status(200).json({ success: true, data: fullUserData }); 
};

/* ========== backend/controllers/cmsController.ts ========== */
// (Code for this controller - ensure no AuthenticatedRequest import)
import { Request, Response, NextFunction } from 'express';
import CMSContent from '../models/CMSContent';

interface UpdateBody { [key: string]: any; }

export async function getAllContent(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await CMSContent.find();
    res.json(items.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}));
  } catch (err) {
    next(err);
  }
}

export async function updateContent(req: Request<{}, {}, UpdateBody>, res: Response, next: NextFunction) {
  try {
    const updates = req.body;
    // CORRECTED: Use optional chaining and _id
    const userId = req.user?._id; 
    const keys = Object.keys(updates);
    const results = [];
    for (const key of keys) {
      const value = updates[key];
      const updated = await CMSContent.findOneAndUpdate(
        { key },
        { value, updatedBy: userId, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      results.push(updated);
    }
    res.json({ success: true, updated: results });
  } catch (err) {
    next(err);
  }
}
