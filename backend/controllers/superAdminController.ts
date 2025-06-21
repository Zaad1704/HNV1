// backend/controllers/superAdminController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Plan from '../models/Plan'; // Import Plan model to get plan names

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

export const getAllMaintenanceRequests = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const requests = await MaintenanceRequest.find({})
        .populate('propertyId', 'name')
        .populate({
            path: 'organizationId',
            select: 'name'
        })
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
});

// --- NEW FUNCTIONS FOR ADMIN DASHBOARD CHARTS ---

// Mock data for Platform Growth
export const getPlatformGrowth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const mockData = [
        { name: 'Jan', 'New Users': 400, 'New Organizations': 240 },
        { name: 'Feb', 'New Users': 300, 'New Organizations': 139 },
        { name: 'Mar', 'New Users': 200, 'New Organizations': 980 },
        { name: 'Apr', 'New Users': 278, 'New Organizations': 390 },
        { name: 'May', 'New Users': 189, 'New Organizations': 480 },
        { name: 'Jun', 'New Users': 239, 'New Organizations': 380 },
        { name: 'Jul', 'New Users': 349, 'New Organizations': 430 },
    ];
    res.status(200).json({ success: true, data: mockData });
});

// Mock data for Plan Distribution
export const getPlanDistribution = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // You'd typically aggregate data from the Subscription and Plan models here.
    // For demonstration, using mock data that includes actual plan names.
    const plans = await Plan.find({ isPublic: true }).select('name');
    const mockData = plans.map((plan, index) => ({
        name: plan.name,
        value: (index + 1) * 10 // Example mock value
    }));

    if (mockData.length === 0) {
        mockData.push(
            { name: 'Free Trial', value: 30 },
            { name: 'Landlord Plan', value: 50 },
            { name: 'Agent Plan', value: 20 }
        );
    }

    res.status(200).json({ success: true, data: mockData });
});
