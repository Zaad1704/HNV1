// backend/controllers/authController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt, { SignOptions } from 'jsonwebtoken'; // Import jsonwebtoken
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
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
        throw new Error('Agent registration must be done via invitation.');
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

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (user && user.password && (await user.matchPassword(password))) {
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' });
        res.json({ token });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
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

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated after Google callback');
    }

    // Replicate the JWT signing logic directly here
    const token = jwt.sign(
        { id: req.user._id, role: req.user.role }, 
        process.env.JWT_SECRET!, 
        { expiresIn: '30d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
});
