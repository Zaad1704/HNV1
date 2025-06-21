// backend/controllers/superAdminController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import MaintenanceRequest from '../models/MaintenanceRequest'; // FIX: Import MaintenanceRequest model

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

export const getModerators = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const moderators = await User.find({ role: 'Super Moderator' });
    res.status(200).json({ success: true, data: moderators });
});

export const getGlobalBilling = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const subscriptions = await Subscription.find({})
        .populate({ path: 'organizationId', select: 'name' })
        .populate({ path: 'planId', select: 'name' });
    res.status(200).json({ success: true, data: subscriptions });
});

// FIX: NEW FUNCTION to get all maintenance requests for Super Admin
export const getAllMaintenanceRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const requests = await MaintenanceRequest.find({})
        .populate('propertyId', 'name')
        .populate({
            path: 'organizationId',
            select: 'name'
        })
        .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json({ success: true, data: requests });
});
