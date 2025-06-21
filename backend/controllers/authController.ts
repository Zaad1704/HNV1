// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'; // FIX: Add this import
import * as jwt from 'jsonwebtoken'; // FIX: Change import to use namespace for jwt
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

export const registerUser = asyncHandler(async (req: Request<any, any, any>, res: Response) => { // FIX: Added type for req.body
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    let organizationId;
    if (role === 'Landlord') {
        const organization = await Organization.create({ name: `${name}'s Organization` });
        const trialPlan = await Plan.findOne({ name: 'Free Trial' });
        if (trialPlan) {
            const trialExpires = new Date();
            trialExpires.setDate(trialExpires.getDate() + 14);
            const subscription = await Subscription.create({
                organizationId: organization._id,
                planId: trialPlan._id,
                status: 'trialing',
                trialExpiresAt: trialExpires,
            });
            organization.subscription = subscription._id;
        }
        organizationId = organization._id;
        await organization.save();
    } else {
        res.status(400);
        throw new new Error('Agent registration must be done via invitation.'); // FIX: Corrected syntax of new Error
    }

    const user = await User.create({ name, email, password, role, organizationId, status: 'active' });
    
    if(role === 'Landlord') {
        await Organization.findByIdAndUpdate(organizationId, { owner: user._id });
    }

    if (user) {
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' });
        res.status(201).json({ token });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const loginUser = asyncHandler(async (req: Request<any, any, any>, res: Response) => { // FIX: Added type for req.body, FIX: Added export
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate({
        path: 'organizationId',
        populate: {
            path: 'subscription',
            populate: { path: 'planId', model: 'Plan' }
        }
    });

    if (user && user.password && (await user.matchPassword(password))) {
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' });
        
        let redirectStatus = 'active'; // Default
        let message = 'Login successful';

        const userOrg = user.organizationId as any; // Type assertion for populated data

        if (user.status && user.status !== 'active') {
            redirectStatus = 'account_inactive';
            message = `Your account is ${user.status}.`;
        } else if (userOrg && user.role !== 'Super Admin' && userOrg.subscription) {
            const subscription = userOrg.subscription as any;
            if (subscription.status !== 'active' && !subscription.isLifetime) {
                redirectStatus = 'subscription_inactive';
                message = 'Organization subscription is inactive.';
            }
        }

        res.json({
            success: true,
            token,
            userStatus: redirectStatus,
            message
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

export const getMe = asyncHandler(async (req: Request, res: Response) => { // FIX: Added export
    if (req.user) {
        const user = await User.findById(req.user._id).populate({
            path: 'organizationId',
            populate: { path: 'subscription', populate: { path: 'planId', model: 'Plan' } }
        });
        res.json({ success: true, user });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => { // FIX: Added export
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated after Google callback');
    }

    const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
});
