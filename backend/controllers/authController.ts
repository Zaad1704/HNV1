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

        // --- THIS IS THE FIX ---
        // We now return the full user object, but without the password.
        const userObject = user.toObject();
        delete userObject.password;

        res.json({
            success: true,
            token,
            user: userObject, // Return the user object
            userStatus: redirectStatus,
            message
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// getMe and googleAuthCallback functions remain the same...
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    // ... existing implementation
});

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    // ... existing implementation
});
