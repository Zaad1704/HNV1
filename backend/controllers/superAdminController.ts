// backend/controllers/superAdminController.ts

import { Request, Response, NextFunction } from 'express'; // Import NextFunction
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const totalUsers = await User.countDocuments();
    const totalOrgs = await Organization.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    res.status(200).json({ success: true, data: { totalUsers, totalOrgs, activeSubscriptions } });
});

export const getAllOrganizations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const organizations = await Organization.find({})
        .populate('owner', 'name email')
        .populate({
            path: 'subscription',
            populate: { path: 'planId', model: 'Plan' }
        });
    res.status(200).json({ success: true, data: organizations });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({}).populate('organizationId', 'name');
    res.status(200).json({ success: true, data: users });
});

export const updateSubscriptionStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const subscription = await Subscription.findOneAndUpdate(
        { organizationId: req.params.id },
        { status },
        { new: true }
    );
    res.status(200).json({ success: true, data: subscription });
});

export const grantLifetimeAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const subscription = await Subscription.findOneAndUpdate(
        { organizationId: req.params.id },
        { isLifetime: true, status: 'active' },
        { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: subscription });
});

export const revokeLifetimeAccess = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const subscription = await Subscription.findOneAndUpdate(
        { organizationId: req.params.id },
        { isLifetime: false, status: 'inactive' },
        { new: true }
    );
    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }
    res.status(200).json({ success: true, message: 'Lifetime access revoked.', data: subscription });
});

export const updateUserByAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { role, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
});
