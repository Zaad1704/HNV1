import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

// Email/Password Registration
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    let organization;
    if (role === 'Landlord') {
        organization = new Organization({ name: `${name}'s Organization` });
        await organization.save();

        const defaultPlan = await Plan.findOne({ name: 'Free Trial' });
        if (!defaultPlan) {
            res.status(500);
            throw new Error('Default plan not found. Please create default plans.');
        }

        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 14);

        const subscription = new Subscription({
            organizationId: organization._id,
            planId: defaultPlan._id,
            status: 'trialing',
            trialExpiresAt,
            currentPeriodEndsAt: trialExpiresAt,
        });
        await subscription.save();

        organization.subscription = subscription._id;
        await organization.save();
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        organizationId: organization ? organization._id : undefined,
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

// Email/Password Login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
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

// Get Current User
export const getMe = asyncHandler(async (req: Request, res: Response) => {
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

// Google OAuth Callback: REDIRECT with token
export const googleAuthCallback = (req: Request, res: Response) => {
    // The Passport Google strategy must attach the JWT token to req.user.token
    const token = req.user && (req.user as any).token;
    if (!token) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no-token`);
    }
    // Redirect to dashboard with the token as a query param
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
};
