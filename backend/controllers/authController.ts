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

        const userObject = user.toObject();
        delete userObject.password;

        res.json({
            success: true,
            token,
            user: userObject,
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
    // This function is reached after Passport successfully authenticates the user
    // req.user should be populated by passport-google-oauth20 strategy
    if (!req.user) {
        // This scenario should ideally be caught by passport.authenticate's failureRedirect,
        // but as a fallback, it's good to handle.
        return res.status(401).json({ success: false, message: 'Google authentication failed. User not found in session.' });
    }

    try {
        // After successful authentication by Passport, req.user holds the user object
        // (either existing or newly created by passport-setup.ts).
        // Now, we need to generate a JWT for this user.
        const user = req.user as any;

        // Fetch the full user object from DB to ensure it has all methods (like getSignedJwtToken)
        // This is a crucial step if Passport.js's deserializeUser returns a plain object.
        const fullUser = await User.findById(user._id).select('+password').populate({
            path: 'organizationId',
            populate: {
                path: 'subscription',
                populate: { path: 'planId', model: 'Plan' }
            }
        });

        if (!fullUser) {
            return res.status(404).json({ success: false, message: 'Authenticated user profile not found in database.' });
        }

        const token = fullUser.getSignedJwtToken(); // Generate JWT

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

        // We now return the full user object, but without the password.
        const userObject = fullUser.toObject();
        delete userObject.password;

        res.json({
            success: true,
            token,
            user: userObject,
            userStatus: redirectStatus,
            message
        });

    } catch (error) {
        console.error('Error in Google Auth Callback:', error);
        res.status(500).json({ success: false, message: 'Server error during authentication process.' });
    }
});
