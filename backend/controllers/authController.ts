import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// Helper function to create and send a secure JWT token
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
        return res.status(403).json({ success: false, message: 'Cannot register a Super Admin account via this route.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with that email already exists' });
        }

        const trialPlan = await Plan.findOne({ name: 'Free Trial' });
        if (!trialPlan) {
            return res.status(500).json({ success: false, message: 'Default trial plan not found. Please contact support.' });
        }

        // Create all new documents in memory first
        const organization = new Organization({ name: `${name}'s Organization` });
        const user: IUser = new User({
            name,
            email,
            password, // The password will be hashed by the 'pre-save' hook in the User model
            role,
            organizationId: organization._id,
        });

        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        const subscription = new Subscription({
            organizationId: organization._id,
            planId: trialPlan._id,
            status: 'trialing',
            trialExpiresAt: trialEndDate,
        });

        // Now, link the documents together
        organization.owner = user._id;
        organization.members.push(user._id);
        organization.subscription = subscription._id;

        // Save all documents. Mongoose will handle resolving the in-memory links.
        await organization.save();
        await user.save();
        await subscription.save();

        // Log the action and send the success response with a token
        auditService.recordAction(user._id, organization._id, 'USER_REGISTER', { registeredUserId: user._id.toString() });
        sendTokenResponse(user, 201, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error during registration.' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    // Explicitly select the password field, which is excluded by default in the model
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    auditService.recordAction(user._id, user.organizationId, 'USER_LOGIN');
    sendTokenResponse(user, 200, res);
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user) {
        // This case should ideally be handled by the 'protect' middleware, but it's good practice to check
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Find the user again but this time populate the organization details including the subscription
    const fullUserData = await User.findById(req.user.id).populate({
        path: 'organizationId',
        select: 'name status subscription',
        populate: { 
            path: 'subscription', 
            model: 'Subscription' // Explicitly specify model for nested populate
        }
    });
    
    res.status(200).json({ success: true, data: fullUserData }); 
};
