import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// This function generates and sends the JWT token in a response
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
    
    // The organizationId is now required on the User model
    const user = new User({ name, email, password, role, organizationId: organization._id });
    
    organization.owner = user._id as mongoose.Types.ObjectId;
    organization.members.push(user._id as mongoose.Types.ObjectId);

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const subscription = new Subscription({
        organizationId: organization._id,
        planId: trialPlan._id,
        status: 'trialing',
        trialExpiresAt: trialEndDate,
    });
    
    organization.subscription = subscription._id as mongoose.Types.ObjectId;
    
    await organization.save();
    await user.save();
    await subscription.save();
    
    // Now that organizationId is required on user, this call is safe
    auditService.recordAction(user._id as mongoose.Types.ObjectId, user.organizationId, 'USER_REGISTER', { registeredUserId: (user._id as mongoose.Types.ObjectId).toString() });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    
    // We select the password field explicitly as it's not returned by default
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        console.error(`Login failed: User not found for email ${email}`);
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        // user.organizationId is guaranteed to exist due to the model change
        auditService.recordAction(
            user._id as mongoose.Types.ObjectId, 
            user.organizationId, 
            'LOGIN_FAILURE', 
            { reason: 'Incorrect password' }
        );
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // user.organizationId is guaranteed to exist
    auditService.recordAction(user._id as mongoose.Types.ObjectId, user.organizationId, 'USER_LOGIN', {});
    sendTokenResponse(user, 200, res);
};

// The 'AuthenticatedRequest' type is no longer needed as we augmented the global Express.Request type
export const getMe = async (req: Request, res: Response) => { 
    if (!req.user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const fullUserData = await User.findById(req.user.id).populate({
        path: 'organizationId',
        select: 'name status subscription',
        populate: { path: 'subscription', model: 'Subscription' }
    });
    res.status(200).json({ success: true, data: fullUserData }); 
};
