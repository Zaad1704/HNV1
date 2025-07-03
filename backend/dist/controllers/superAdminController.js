"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.createPlan = exports.updateSiteContent = exports.getPlanDistribution = exports.getPlatformGrowth = exports.getAllMaintenanceRequests = exports.getGlobalBilling = exports.getModerators = exports.updateUserByAdmin = exports.toggleSelfDeletion = exports.updateOrganizationSubscription = exports.revokeLifetimeAccess = exports.grantLifetimeAccess = exports.updateSubscriptionStatus = exports.getAllUsers = exports.getAllOrganizations = exports.getDashboardStats = exports.deleteOrganization = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Plan_1 = __importDefault(require("../models/Plan"));
const date_fns_1 = require("date-fns");
const mongoose_1 = require("mongoose");
const masterDataService_1 = __importDefault(require("../services/masterDataService"));
exports.deleteOrganization = (0, express_async_handler_1.default)(async (req, res) => {
    const { orgId } = req.params;
    const organization = await Organization_1.default.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }
    await User_1.default.deleteMany({ organizationId: orgId });
    await Subscription_1.default.deleteMany({ organizationId: orgId });
    await organization.deleteOne();
    res.status(200).json({ success: true, message: `Organization '${organization.name}' and all associated data has been deleted.` });
});
exports.getDashboardStats = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const totalOrgs = await Organization_1.default.countDocuments();
        const activeSubscriptions = await Subscription_1.default.countDocuments({ status: { $in: ['active', 'trialing'] } });
        const subscriptions = await Subscription_1.default.find({ status: 'active' }).populate('planId');
        const totalRevenue = subscriptions.reduce((sum, sub) => {
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
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
});
exports.getAllOrganizations = (0, express_async_handler_1.default)(async (req, res, next) => {
    const organizations = await Organization_1.default.find({})
        .populate('owner', 'name email')
        .populate({
        path: 'subscription',
        populate: { path: 'planId', model: 'Plan' }
    });
    res.status(200).json({ success: true, data: organizations });
});
exports.getAllUsers = (0, express_async_handler_1.default)(async (req, res, next) => {
    const users = await User_1.default.find({}).populate('organizationId', 'name');
    res.status(200).json({ success: true, data: users });
});
exports.updateSubscriptionStatus = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { status } = req.body;
    const subscription = await Subscription_1.default.findOneAndUpdate({ organizationId: req.params.id }, { status }, { new: true });
    res.status(200).json({ success: true, data: subscription });
});
exports.grantLifetimeAccess = (0, express_async_handler_1.default)(async (req, res, next) => {
    const subscription = await Subscription_1.default.findOneAndUpdate({ organizationId: req.params.id }, { isLifetime: true, status: 'active' }, { new: true, upsert: true });
    res.status(200).json({ success: true, data: subscription });
});
exports.revokeLifetimeAccess = (0, express_async_handler_1.default)(async (req, res, next) => {
    const subscription = await Subscription_1.default.findOneAndUpdate({ organizationId: req.params.id }, { isLifetime: false, status: 'inactive' }, { new: true });
    if (!subscription) {
        res.status(404);
        throw new Error('Subscription not found');
    }
    res.status(200).json({ success: true, message: 'Lifetime access revoked.', data: subscription });
});
exports.updateOrganizationSubscription = (0, express_async_handler_1.default)(async (req, res) => {
    const { orgId } = req.params;
    const { planId, status } = req.body;
    const organization = await Organization_1.default.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }
    const plan = await Plan_1.default.findById(planId);
    if (!plan) {
        res.status(400);
        throw new Error('Invalid plan selected.');
    }
    let subscription = await Subscription_1.default.findOne({ organizationId: orgId });
    let currentPeriodEndsAt;
    if (status === 'active' || status === 'trialing') {
        const now = new Date();
        switch (plan.duration) {
            case 'daily':
                currentPeriodEndsAt = (0, date_fns_1.addDays)(now, 1);
                break;
            case 'weekly':
                currentPeriodEndsAt = (0, date_fns_1.addWeeks)(now, 1);
                break;
            case 'monthly':
                currentPeriodEndsAt = (0, date_fns_1.addMonths)(now, 1);
                break;
            case 'yearly':
                currentPeriodEndsAt = (0, date_fns_1.addYears)(now, 1);
                break;
            default: currentPeriodEndsAt = undefined;
        }
    }
    else {
        currentPeriodEndsAt = undefined;
    }
    const subscriptionData = {
        planId: plan._id,
        status: status,
        isLifetime: false,
        currentPeriodEndsAt: currentPeriodEndsAt,
        trialExpiresAt: status === 'trialing' ? currentPeriodEndsAt : undefined,
    };
    if (subscription) {
        Object.assign(subscription, subscriptionData);
        await subscription.save();
    }
    else {
        subscription = await Subscription_1.default.create({
            organizationId: new mongoose_1.Types.ObjectId(orgId),
            ...subscriptionData
        });
        organization.subscription = subscription._id;
        await organization.save();
    }
    res.status(200).json({ success: true, message: 'Organization subscription updated.', data: subscription });
});
exports.toggleSelfDeletion = (0, express_async_handler_1.default)(async (req, res) => {
    const { orgId } = req.params;
    const { enable } = req.body;
    const organization = await Organization_1.default.findByIdAndUpdate(orgId, { allowSelfDeletion: enable }, { new: true });
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
exports.updateUserByAdmin = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { userId } = req.params;
    const { role, status } = req.body;
    const user = await User_1.default.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (role)
        user.role = role;
    if (status)
        user.status = status;
    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
});
exports.getModerators = (0, express_async_handler_1.default)(async (req, res, next) => {
    const moderators = await User_1.default.find({ role: 'Super Moderator' });
    res.status(200).json({ success: true, data: moderators });
});
exports.getGlobalBilling = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const subscriptions = await Subscription_1.default.find({})
            .populate({ path: 'organizationId', select: 'name' })
            .populate({ path: 'planId', select: 'name price' });
        const totalRevenue = subscriptions.reduce((sum, sub) => {
            return sum + (sub.planId?.price || 0);
        }, 0);
        const monthlyRevenue = subscriptions
            .filter((sub) => sub.status === 'active' && sub.planId?.duration === 'monthly')
            .reduce((sum, sub) => sum + (sub.planId?.price || 0), 0);
        const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active').length;
        const churnRate = subscriptions.filter((sub) => sub.status === 'canceled').length / subscriptions.length * 100;
        const recentTransactions = subscriptions.slice(0, 10).map((sub) => ({
            _id: sub._id,
            organizationName: sub.organizationId?.name || 'Unknown',
            amount: sub.planId?.price || 0,
            status: sub.status === 'active' ? 'completed' : 'pending',
            date: sub.createdAt || new Date(),
            planName: sub.planId?.name || 'Unknown'
        }));
        const revenueChart = [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
            const monthSubs = subscriptions.filter((sub) => {
                const subDate = new Date(sub.createdAt);
                return subDate.getMonth() === monthStart.getMonth() && subDate.getFullYear() === monthStart.getFullYear();
            });
            revenueChart.unshift({
                month: months[monthStart.getMonth()],
                revenue: monthSubs.reduce((sum, sub) => sum + (sub.planId?.price || 0), 0),
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
    }
    catch (error) {
        console.error('Billing data error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch billing data' });
    }
});
exports.getAllMaintenanceRequests = (0, express_async_handler_1.default)(async (req, res, next) => {
    const requests = await MaintenanceRequest_1.default.find({})
        .populate('propertyId', 'name')
        .populate({
        path: 'organizationId',
        select: 'name'
    })
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
});
exports.getPlatformGrowth = (0, express_async_handler_1.default)(async (req, res, next) => {
    try {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const data = [];
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(currentYear, new Date().getMonth() - i, 1);
            const monthEnd = new Date(currentYear, new Date().getMonth() - i + 1, 0);
            const newUsers = await User_1.default.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            const newOrgs = await Organization_1.default.countDocuments({
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });
            data.unshift({
                name: months[monthStart.getMonth()],
                'New Users': newUsers,
                'New Organizations': newOrgs
            });
        }
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error('Platform growth error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch platform growth data' });
    }
});
exports.getPlanDistribution = (0, express_async_handler_1.default)(async (req, res, next) => {
    const subscriptions = await Subscription_1.default.find({ status: 'active' }).populate('planId');
    const planCounts = subscriptions.reduce((acc, sub) => {
        const planName = sub.planId?.name || 'Unknown';
        acc[planName] = (acc[planName] || 0) + 1;
        return acc;
    }, {});
    const data = Object.entries(planCounts).map(([name, value]) => ({ name, value }));
    res.status(200).json({ success: true, data });
});
exports.updateSiteContent = (0, express_async_handler_1.default)(async (req, res) => {
    const { section } = req.params;
    const updatedSettings = await masterDataService_1.default.updateSiteContent(section, req.body);
    res.status(200).json({ success: true, data: updatedSettings });
});
exports.createPlan = (0, express_async_handler_1.default)(async (req, res) => {
    const plan = await masterDataService_1.default.createPlan(req.body);
    res.status(201).json({ success: true, data: plan });
});
exports.updatePlan = (0, express_async_handler_1.default)(async (req, res) => {
    const { planId } = req.params;
    const plan = await masterDataService_1.default.updatePlan(planId, req.body);
    res.status(200).json({ success: true, data: plan });
});
exports.deletePlan = (0, express_async_handler_1.default)(async (req, res) => {
    const { planId } = req.params;
    await masterDataService_1.default.deletePlan(planId);
    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
});
