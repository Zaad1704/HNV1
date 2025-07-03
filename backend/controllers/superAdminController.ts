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
    try {
        const totalUsers = await User.countDocuments();
        const totalOrgs = await Organization.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: { $in: ['active', 'trialing'] } });
        
        // Calculate total revenue from active subscriptions
        const subscriptions = await Subscription.find({ status: 'active' }).populate('planId');
        const totalRevenue = subscriptions.reduce((sum, sub: any) => {
            return sum + (sub.planId?.price || 0);
        }, 0);
        
        res.status(200).json({ 
            success: true, 
            data: {
                totalUsers,
                totalOrgs,
                activeSubscriptions,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
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
    if (status) {
        user.status = status;
        
        // If user is being deactivated, cancel their organization's subscription
        if (status === 'inactive' && user.organizationId) {
            await Subscription.findOneAndUpdate(
                { organizationId: user.organizationId },
                { 
                    status: 'canceled',
                    canceledAt: new Date(),
                    currentPeriodEndsAt: new Date() // End immediately
                }
            );
        }
    }

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
});

export const getModerators = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const moderators = await User.find({ role: 'Super Moderator' });
    res.status(200).json({ success: true, data: moderators });
});

export const getGlobalBilling = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subscriptions = await Subscription.find({})
            .populate({ path: 'organizationId', select: 'name' })
            .populate({ path: 'planId', select: 'name price' });
        
        // Calculate billing metrics
        const totalRevenue = subscriptions.reduce((sum, sub: any) => {
            return sum + (sub.planId?.price || 0);
        }, 0);
        
        const monthlyRevenue = subscriptions
            .filter((sub: any) => sub.status === 'active' && sub.planId?.duration === 'monthly')
            .reduce((sum, sub: any) => sum + (sub.planId?.price || 0), 0);
        
        const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active').length;
        const churnRate = subscriptions.filter((sub: any) => sub.status === 'canceled').length / subscriptions.length * 100;
        
        // Recent transactions (mock for now, replace with actual payment data)
        const recentTransactions = subscriptions.slice(0, 10).map((sub: any) => ({
            _id: sub._id,
            organizationName: sub.organizationId?.name || 'Unknown',
            amount: sub.planId?.price || 0,
            status: sub.status === 'active' ? 'completed' : 'pending',
            date: sub.createdAt || new Date(),
            planName: sub.planId?.name || 'Unknown'
        }));
        
        // Revenue chart data
        const revenueChart = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
            const monthSubs = subscriptions.filter((sub: any) => {
                const subDate = new Date(sub.createdAt);
                return subDate.getMonth() === monthStart.getMonth() && subDate.getFullYear() === monthStart.getFullYear();
            });
            
            revenueChart.unshift({
                month: months[monthStart.getMonth()],
                revenue: monthSubs.reduce((sum, sub: any) => sum + (sub.planId?.price || 0), 0),
                subscriptions: monthSubs.length
            });
        }
        
        res.status(200).json({ 
            success: true, 
            data: {
                totalRevenue,
                monthlyRevenue,
                activeSubscriptions,
                churnRate: Math.round(churnRate * 100) / 100,
                recentTransactions,
                revenueChart
            }
        });
    } catch (error) {
        console.error('Billing data error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch billing data' });
    }
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
    try {
        console.log('Fetching platform growth data...');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const data = [];
        
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(currentYear, new Date().getMonth() - i, 1);
            const monthEnd = new Date(currentYear, new Date().getMonth() - i + 1, 0);
            
            const newUsers = await User.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            
            const newOrgs = await Organization.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            
            data.unshift({
                name: months[monthStart.getMonth()],
                'New Users': newUsers,
                'New Organizations': newOrgs
            });
        }
        
        console.log('Platform growth data fetched successfully:', data.length, 'months');
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Platform growth error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch platform growth data', error: error.message });
    }
});

export const getPlanDistribution = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Fetching plan distribution data...');
        const subscriptions = await Subscription.find({ status: 'active' }).populate('planId');
        console.log('Found active subscriptions:', subscriptions.length);
        
        const planCounts = subscriptions.reduce((acc: any, sub: any) => {
            const planName = sub.planId?.name || 'Unknown';
            acc[planName] = (acc[planName] || 0) + 1;
            return acc;
        }, {});
        
        let data = Object.entries(planCounts).map(([name, value]) => ({ name, value }));
        

        
        console.log('Plan distribution data:', data);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Plan distribution error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch plan distribution data', error: error.message });
    }
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
