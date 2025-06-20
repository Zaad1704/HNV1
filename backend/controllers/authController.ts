// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import { registerSchema } from '../validators/userValidator';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // For a new Landlord, create a new Organization and a trial subscription
    let organizationId;
    if (role === 'Landlord') {
        const organization = await Organization.create({
            name: `${name}'s Organization`,
        });

        // Find the default "Free Trial" plan to assign to the new organization
        const trialPlan = await Plan.findOne({ name: 'Free Trial' });
        if (trialPlan) {
            const trialExpires = new Date();
            trialExpires.setDate(trialExpires.getDate() + 14); // 14-day trial

            const subscription = await Subscription.create({
                organizationId: organization._id,
                planId: trialPlan._id,
                status: 'trialing',
                trialExpiresAt: trialExpires,
            });
            organization.subscription = subscription._id;
        }
        
        organizationId = organization._id;
        // The owner will be set after the user is created
        organization.owner = (await User.findOne({email}))?._id; // This needs to be updated after user creation.
        await organization.save();

    } else {
        // For Agents, organization assignment happens via invitation, so this path is less common
        res.status(400);
        throw new Error('Agent registration should be done via invitation.');
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        organizationId,
        status: 'active'
    });
    
    // Now that user exists, set them as the owner of the organization
    if(role === 'Landlord') {
        await Organization.findByIdAndUpdate(organizationId, { owner: user._id });
    }

    if (user) {
        res.status(201).json({
            token: user.getSignedJwtToken(),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && user.password && (await user.matchPassword(password))) {
        res.json({
            token: user.getSignedJwtToken(),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    // req.user is populated by the 'protect' middleware
    if (req.user) {
        // Refetch user to get all populated details if necessary
        const user = await User.findById(req.user._id).populate({
            path: 'organizationId',
            populate: {
                path: 'subscription',
                populate: {
                    path: 'planId',
                    model: 'Plan'
                }
            }
        });
        res.json({ success: true, user });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Handles the callback from Google OAuth
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated after Google callback');
    }

    const token = req.user.getSignedJwtToken();
    // Redirect back to a dedicated page on the frontend to handle the token
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
});
