"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const superAdminController_1 = require("../controllers/superAdminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin', 'Super Moderator']));
router.get('/dashboard-stats', (0, express_async_handler_1.default)(superAdminController_1.getDashboardStats));
router.get('/platform-growth', (0, express_async_handler_1.default)(superAdminController_1.getPlatformGrowth));
router.get('/plan-distribution', (0, express_async_handler_1.default)(superAdminController_1.getPlanDistribution));
router.get('/organizations', (0, express_async_handler_1.default)(superAdminController_1.getAllOrganizations));
router.put('/organizations/:id/status', (0, express_async_handler_1.default)(superAdminController_1.updateSubscriptionStatus));
router.patch('/organizations/:id/activate', (0, express_async_handler_1.default)(async (req, res) => {
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOneAndUpdate({ organizationId: req.params.id }, { status: 'active' }, { new: true, upsert: true });
    res.json({ success: true, data: subscription });
}));
router.patch('/organizations/:id/deactivate', (0, express_async_handler_1.default)(async (req, res) => {
    const Subscription = require('../models/Subscription');
    const subscription = await Subscription.findOneAndUpdate({ organizationId: req.params.id }, { status: 'inactive' }, { new: true });
    res.json({ success: true, data: subscription });
}));
router.patch('/organizations/:id/grant-lifetime', (0, express_async_handler_1.default)(superAdminController_1.grantLifetimeAccess));
router.patch('/organizations/:id/revoke-lifetime', (0, express_async_handler_1.default)(superAdminController_1.revokeLifetimeAccess));
router.delete('/organizations/:orgId', (0, express_async_handler_1.default)(superAdminController_1.deleteOrganization));
router.put('/organizations/:orgId/subscription', (0, express_async_handler_1.default)(superAdminController_1.updateOrganizationSubscription));
router.put('/organizations/:orgId/toggle-self-deletion', (0, express_async_handler_1.default)(superAdminController_1.toggleSelfDeletion));
router.get('/users', (0, express_async_handler_1.default)(superAdminController_1.getAllUsers));
router.put('/users/:userId/manage', (0, express_async_handler_1.default)(superAdminController_1.updateUserByAdmin));
router.delete('/users/:userId', (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findByIdAndDelete(req.params.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    res.json({ success: true, message: 'User deleted successfully' });
}));
router.post('/moderators', (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User_1.default.create({
        name,
        email,
        password,
        role: 'Super Moderator',
        organizationId: req.user?.organizationId,
        isEmailVerified: true,
        status: 'active'
    });
    res.status(201).json({ success: true, data: user });
}));
router.get('/moderators', (0, express_async_handler_1.default)(superAdminController_1.getModerators));
router.put('/moderators/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, status } = req.body;
    const user = await User_1.default.findByIdAndUpdate(req.params.id, { name, email, status: status === 'active' ? 'active' : 'suspended' }, { new: true });
    if (!user) {
        res.status(404).json({ success: false, message: 'Moderator not found' });
        return;
    }
    res.json({ success: true, data: user });
}));
router.delete('/moderators/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findByIdAndDelete(req.params.id);
    if (!user) {
        res.status(404).json({ success: false, message: 'Moderator not found' });
        return;
    }
    res.json({ success: true, message: 'Moderator removed successfully' });
}));
router.get('/billing', (0, express_async_handler_1.default)(superAdminController_1.getGlobalBilling));
router.get('/plans', (0, express_async_handler_1.default)(async (req, res) => {
    const Plan = require('../models/Plan');
    const plans = await Plan.find({}).sort({ price: 1 });
    res.json({ success: true, data: plans });
}));
router.post('/plans', (0, express_async_handler_1.default)(async (req, res) => {
    const Plan = require('../models/Plan');
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
}));
router.put('/plans/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const Plan = require('../models/Plan');
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) {
        res.status(404).json({ success: false, message: 'Plan not found' });
        return;
    }
    res.json({ success: true, data: plan });
}));
router.delete('/plans/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const Plan = require('../models/Plan');
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
        res.status(404).json({ success: false, message: 'Plan not found' });
        return;
    }
    res.json({ success: true, message: 'Plan deleted successfully' });
}));
router.put('/users/:userId/plan', (0, express_async_handler_1.default)(async (req, res) => {
    const { planId } = req.body;
    const Subscription = require('../models/Subscription');
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
    }
    const subscription = await Subscription.findOneAndUpdate({ organizationId: user.organizationId }, { planId, status: 'active' }, { new: true, upsert: true });
    res.json({ success: true, data: subscription });
}));
router.get('/all-maintenance-requests', (0, express_async_handler_1.default)(superAdminController_1.getAllMaintenanceRequests));
router.put('/site-content/:section', (0, express_async_handler_1.default)(superAdminController_1.updateSiteContent));
router.post('/plans-enhanced', (0, express_async_handler_1.default)(superAdminController_1.createPlan));
router.put('/plans-enhanced/:planId', (0, express_async_handler_1.default)(superAdminController_1.updatePlan));
router.delete('/plans-enhanced/:planId', (0, express_async_handler_1.default)(superAdminController_1.deletePlan));
exports.default = router;
