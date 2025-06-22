// backend/controllers/superAdminController.ts

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Plan from '../models/Plan';
import { addMonths, addYears, addWeeks, addDays } from 'date-fns'; // Import date-fns utilities

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

// NEW FUNCTION for A.1: Update an organization's subscription plan and status
export const updateOrganizationSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params; // Org ID from URL
    const { planId, status } = req.body; // New plan ID and desired status

    const organization = await Organization.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
        res.status(400);
        throw new Error('Invalid plan selected.');
    }

    let subscription = await Subscription.findOne({ organizationId: orgId });
    let currentPeriodEndsAt: Date | undefined;

    // Calculate currentPeriodEndsAt based on plan duration if setting to active/trialing
    if (status === 'active' || status === 'trialing') {
        const now = new Date();
        switch (plan.duration) {
            case 'daily':
                currentPeriodEndsAt = addDays(now, 1);
                break;
            case 'weekly':
                currentPeriodEndsAt = addWeeks(now, 1);
                break;
            case 'monthly':
                currentPeriodEndsAt = addMonths(now, 1);
                break;
            case 'yearly':
                currentPeriodEndsAt = addYears(now, 1);
                break;
            default:
                currentPeriodEndsAt = undefined; // Or handle as an error if duration is critical
        }
    } else {
        currentPeriodEndsAt = undefined; // Clear if setting to inactive/canceled
    }

    const subscriptionData: any = {
        planId: plan._id,
        status: status,
        isLifetime: false, // Assume not lifetime unless explicitly set by grantLifetimeAccess
        currentPeriodEndsAt: currentPeriodEndsAt,
        // trialExpiresAt might need to be set if status is 'trialing' but not current context
        // For simplicity, we assume 'trialing' means trialExpiresAt is also set, which might be handled elsewhere or explicitly added here.
        // For now, if status is 'trialing', we set trialExpiresAt to currentPeriodEndsAt.
        trialExpiresAt: status === 'trialing' ? currentPeriodEndsAt : undefined,
    };

    if (subscription) {
        // Update existing subscription
        Object.assign(subscription, subscriptionData);
        await subscription.save();
    } else {
        // Create new subscription if none exists
        subscription = await Subscription.create({
            organizationId: orgId,
            ...subscriptionData
        });
        // Link the new subscription to the organization
        organization.subscription = subscription._id;
        await organization.save();
    }

    res.status(200).json({ success: true, message: 'Organization subscription updated.', data: subscription });
});

// NEW FUNCTION for A.2: Toggle an organization's self-service data deletion setting
export const toggleSelfDeletion = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { enable } = req.body; // 'enable' is a boolean

    const organization = await Organization.findByIdAndUpdate(
        orgId,
        { allowSelfDeletion: enable },
        { new: true }
    );

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }

    res.status(200).json({
        success: true,
        message: `Self-service deletion for ${organization.name} is now ${enable ? 'enabled' : 'disabled'}.`,
        data: { orgId: organization._id, allowSelfDeletion: organization.allowSelfDeletion }
    });
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

export const getPlanDistribution = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const plans = await Plan.find({ isPublic: true }).select('name');
    const mockData = plans.map((plan, index) => ({
        name: plan.name,
        value: (index + 1) * 10 
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
