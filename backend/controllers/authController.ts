import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import emailService from '../services/emailService';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ObjectId } from 'mongoose';

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
        return res.status(403).json({ success: false, message: 'Cannot register a Super Admin account.' });
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

        // Step 1: Create a new organization, but don't save it yet.
        const organization = new Organization({ name: `${name}'s Organization` });

        // Step 2: Create a new user, linking the organization's ID.
        const user: IUser = new User({
            name,
            email,
            password,
            role,
            organizationId: organization._id as ObjectId,
        });

        // Step 3: Link the user as the owner of the organization.
        organization.owner = user._id as ObjectId;
        organization.members.push(user._id as ObjectId);

        // Step 4: Create the trial subscription.
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        const subscription = new Subscription({
            organizationId: organization._id as ObjectId,
            planId: trialPlan._id as ObjectId,
            status: 'trialing',
            trialExpiresAt: trialEndDate,
        });
        organization.subscription = subscription._id as ObjectId;

        // Step 5: Save all documents. Mongoose will handle the order correctly.
        await organization.save();
        await user.save();
        await subscription.save();

        // Step 6: Log the action and send response.
        auditService.recordAction(user._id as ObjectId, organization._id as ObjectId, 'USER_REGISTER', { registeredUserId: user._id.toString() });
        sendTokenResponse(user, 201, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password') as IUser;
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    auditService.recordAction(user._id as ObjectId, user.organizationId as ObjectId, 'USER_LOGIN');
    sendTokenResponse(user, 200, res);
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const fullUserData = await User.findById(req.user.id).populate({
        path: 'organizationId',
        select:
