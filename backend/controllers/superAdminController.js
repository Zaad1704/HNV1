"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanDistribution = exports.getPlatformGrowth = exports.getAllMaintenanceRequests = exports.getGlobalBilling = exports.getModerators = exports.updateUserByAdmin = exports.toggleSelfDeletion = exports.updateOrganizationSubscription = exports.revokeLifetimeAccess = exports.grantLifetimeAccess = exports.updateSubscriptionStatus = exports.getAllUsers = exports.getAllOrganizations = exports.getDashboardStats = exports.deleteOrganization = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Plan_1 = __importDefault(require("../models/Plan"));
const date_fns_1 = require("date-fns");
const mongoose_1 = require("mongoose");
exports.deleteOrganization = (0, express_async_handler_1.default)(async (req, res) => {
    const { orgId } = req.params;
    const organization = await Organization_1.default.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }
    // Perform a soft cascade delete
    // 1. Delete all users belonging to the organization
    await User_1.default.deleteMany({ organizationId: orgId });
    // 2. Delete the subscription associated with the organization
    await Subscription_1.default.deleteMany({ organizationId: orgId });
    // 3. Delete the organization itself
    await organization.deleteOne();
    res.status(200).json({ success: true, message: `Organization '${organization.name}' and all associated data has been deleted.` });
});
exports.getDashboardStats = (0, express_async_handler_1.default)(async (req, res, next) => {
    const totalUsers = await User_1.default.countDocuments();
    const totalOrgs = await Organization_1.default.countDocuments();
    const activeSubscriptions = await Subscription_1.default.countDocuments({ status: 'active' });
    res.status(200).json({ success: true, data: { totalUsers, totalOrgs, activeSubscriptions } });
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
// FIX: Added 'export' to all the functions below so they can be imported in the routes file.
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
    const subscriptions = await Subscription_1.default.find({})
        .populate({ path: 'organizationId', select: 'name' })
        .populate({ path: 'planId', select: 'name' });
    res.status(200).json({ success: true, data: subscriptions });
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
exports.getPlanDistribution = (0, express_async_handler_1.default)(async (req, res, next) => {
    const plans = await Plan_1.default.find({ isPublic: true }).select('name');
    const mockData = plans.map((plan, index) => ({
        name: plan.name,
        value: (index + 1) * 10
    }));
    if (mockData.length === 0) {
        mockData.push({ name: 'Free Trial', value: 30 }, { name: 'Landlord Plan', value: 50 }, { name: 'Agent Plan', value: 20 });
    }
    res.status(200).json({ success: true, data: mockData });
});
//# sourceMappingURL=superAdminController.js.map