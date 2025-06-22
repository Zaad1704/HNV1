// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

// registerUser function remains the same...
export const registerUser = asyncHandler(async (req: Request<any, any, any>, res: Response) => {
    // ... existing implementation
    // This part of the code was not in the provided error logs, assuming it's correct.
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    let organization;
    if (role === 'Landlord') {
        // Create a new organization for the landlord
        organization = new Organization({ name: `${name}'s Organization` });
        await organization.save();

        // Create a default trial subscription for the new organization
        const defaultPlan = await Plan.findOne({ name: 'Free Trial' }); // Assuming 'Free Trial' plan exists
        if (!defaultPlan) {
            res.status(500);
            throw new Error('Default plan not found. Please create default plans.');
        }

        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 14); // 14-day trial

        const subscription = new Subscription({
            organizationId: organization._id,
            planId: defaultPlan._id,
            status: 'trialing',
            trialExpiresAt: trialExpiresAt,
            currentPeriodEndsAt: trialExpiresAt, // For trial, it's when trial ends
        });
        await subscription.save();

        // Link subscription to organization
        organization.subscription = subscription._id;
        await organization.save();
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        organizationId: organization ? organization._id : undefined, // Assign organization only if created
    });

    if (user) {
        const token = user.getSignedJwtToken();
        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
            },
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const loginUser = asyncHandler(async (req: Request<any, any, any>, res: Response) => {
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
        
        let redirectStatus = 'active';
        let message = 'Login successful';
        const userOrg = user.organizationId as any;

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

        const userObject = user.toObject();
        delete userObject.password;

        res.json({
            success: true,
            token,
            user: userObject,
            userStatus: redirectStatus,
            message
        });
        // No explicit return needed here as res.json() terminates the response.
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    // This part of the code was not in the provided error logs, assuming it's correct.
    const user = await User.findById(req.user!._id).select('-password').populate({
        path: 'organizationId',
        populate: {
            path: 'subscription',
            populate: { path: 'planId', model: 'Plan' }
        }
    });

    if (user) {
        res.json({ success: true, user: user.toObject() });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    // This function is reached after Passport successfully authenticates the user
    // req.user should be populated by passport-google-oauth20 strategy
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Google authentication failed. User not found in session.' });
        return; // Explicitly return void after sending response
    }

    try {
        const user = req.user as any;
        const fullUser = await User.findById(user._id).select('+password').populate({
            path: 'organizationId',
            populate: {
                path: 'subscription',
                populate: { path: 'planId', model: 'Plan' }
            }
        });

        if (!fullUser) {
            res.status(404).json({ success: false, message: 'Authenticated user profile not found in database.' });
            return; // Explicitly return void after sending response
        }

        const token = fullUser.getSignedJwtToken();

        let redirectStatus = 'active';
        let message = 'Login successful';
        const userOrg = fullUser.organizationId as any;

        if (fullUser.status && fullUser.status !== 'active') {
            redirectStatus = 'account_inactive';
            message = `Your account is ${fullUser.status}.`;
        } else if (userOrg && fullUser.role !== 'Super Admin' && userOrg.subscription) {
            const subscription = userOrg.subscription as any;
            if (subscription.status !== 'active' && !subscription.isLifetime) {
                redirectStatus = 'subscription_inactive';
                message = 'Organization subscription is inactive.';
            }
        }

        const userObject = fullUser.toObject();
        delete userObject.password;

        res.json({
            success: true,
            token,
            user: userObject,
            userStatus: redirectStatus,
            message
        });
        // No explicit return needed here as res.json() terminates the response.

    } catch (error) {
        console.error('Error in Google Auth Callback:', error);
        res.status(500).json({ success: false, message: 'Server error during authentication process.' });
        // No explicit return needed here as res.status().json() terminates the response.
    }
});
