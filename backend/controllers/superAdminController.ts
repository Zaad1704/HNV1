// backend/controllers/superAdminController.ts
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Plan from '../models/Plan';
import { addMonths, addYears, addWeeks, addDays } from 'date-fns';
import { Types } from 'mongoose';
import masterDataService from '../services/masterDataService';


export const deleteOrganization = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;

    const organization = await Organization.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }

    // Perform a soft cascade delete
    // 1. Delete all users belonging to the organization
    await User.deleteMany({ organizationId: orgId });
    // 2. Delete the subscription associated with the organization
    await Subscription.deleteMany({ organizationId: orgId });
    // 3. Delete the organization itself
    await organization.deleteOne();

    res.status(200).json({ success: true, message: `Organization '${organization.name}' and all associated data has been deleted.` });
});


export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const systemOverview = await masterDataService.getSystemOverview();
    res.status(200).json({ success: true, data: systemOverview });
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

// FIX: Added 'export' to all the functions below so they can be imported in the routes file.

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

export const updateOrganizationSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { planId, status } = req.body;

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

    if (status === 'active' || status === 'trialing') {
        const now = new Date();
        switch (plan.duration) {
            case 'daily': currentPeriodEndsAt = addDays(now, 1); break;
            case 'weekly': currentPeriodEndsAt = addWeeks(now, 1); break;
            case 'monthly': currentPeriodEndsAt = addMonths(now, 1); break;
            case 'yearly': currentPeriodEndsAt = addYears(now, 1); break;
            default: currentPeriodEndsAt = undefined;
        }
    } else {
        currentPeriodEndsAt = undefined;
    }

    const subscriptionData: any = {
        planId: plan._id,
        status: status,
        isLifetime: false,
        currentPeriodEndsAt: currentPeriodEndsAt,
        trialExpiresAt: status === 'trialing' ? currentPeriodEndsAt : undefined,
    };

    if (subscription) {
        Object.assign(subscription, subscriptionData);
        await subscription.save();
    } else {
        subscription = await Subscription.create({
            organizationId: new Types.ObjectId(orgId as string),
            ...subscriptionData
        });
        organization.subscription = subscription._id;
        await organization.save();
    }

    res.status(200).json({ success: true, message: 'Organization subscription updated.', data: subscription });
});

export const toggleSelfDeletion = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { enable } = req.body;

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
    const subscriptions = await Subscription.find({ status: 'active' }).populate('planId');
    const planCounts = subscriptions.reduce((acc: any, sub: any) => {
        const planName = sub.planId?.name || 'Unknown';
        acc[planName] = (acc[planName] || 0) + 1;
        return acc;
    }, {});
    
    const data = Object.entries(planCounts).map(([name, value]) => ({ name, value }));
    res.status(200).json({ success: true, data });
});

// New endpoints for content management
export const updateSiteContent = asyncHandler(async (req: Request, res: Response) => {
    const { section } = req.params;
    const updatedSettings = await masterDataService.updateSiteContent(section, req.body);
    res.status(200).json({ success: true, data: updatedSettings });
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
    const plan = await masterDataService.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;
    const plan = await masterDataService.updatePlan(planId, req.body);
    res.status(200).json({ success: true, data: plan });
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;
    await masterDataService.deletePlan(planId);
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
});
