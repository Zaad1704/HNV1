"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Plan_1 = __importDefault(require("../models/Plan"));
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const module_1 = require();
from;
'../controllers/superAdminController';
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use((req, res, next) => { next(); });
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Super admin routes working', timestamp: new Date() });
});
router.get('/health', (req, res) => {
    res.json({}, success, true, message, 'Super admin service healthy', timestamp, new Date(), endpoints, { 'dashboard-stats': 'Requires auth',
        'platform-growth': 'Requires auth',
        'plan-distribution': 'Requires auth',
        'email-status': 'Requires auth'
    });
});
router.use((req, res, next) => {
    if (req.path === '/test' || req.path === '/health')
        return next();
    (0, authMiddleware_1.protect)(req, res, () => { });
    if (!req.user || (req.user.role !== 'Super Admin' && req.user.role !== 'Super Moderator')) {
        return res.status(403).json({}, success, false, message, 'Access denied. Super Admin role required.', userRole, req.user?.role || 'No role', requiredRoles, ['Super Admin', 'Super Moderator']);
    }
});
next();
;
;
router.get('/dashboard-stats', (0, express_async_handler_1.default)(module_1.getDashboardStats));
router.get('/stats', (0, express_async_handler_1.default)(module_1.getDashboardStats));
router.get('/platform-growth', (0, express_async_handler_1.default)(module_1.getPlatformGrowth));
router.get('/plan-distribution', (0, express_async_handler_1.default)(module_1.getPlanDistribution));
router.get('/debug-routes', (req, res) => {
    res.json({}, success, true, availableRoutes, [
        'GET /dashboard-stats',
        'GET /platform-growth',
        'GET /plan-distribution',
        'GET /email-status',
        'GET /organizations',
        'GET /users',
        'GET /billing'
    ], timestamp, new Date().toISOString());
});
;
router.get('/organizations', async (req, res) => {
    try { }
    finally {
    }
    const organizations = await Organization_1.default.find({})
        .populate('owner', 'name email')
        .populate({ path: 'subscription',
        populate: {},
        path: 'planId',
        select: 'name price duration'
    });
    res.json({ success: true, data: organizations || [] });
});
try { }
catch (error) {
    console.error('Organizations fetch error:', error);
}
res.json({ success: true, data: [] });
;
router.put('/organizations/:id/status', (0, express_async_handler_1.default)(module_1.updateSubscriptionStatus));
router.patch('/organizations/:id/activate', (0, express_async_handler_1.default)(async (req, res) => { const subscription = await Subscription_1.default.findOneAndUpdate(); }, { organizationId: req.params.id }, { status: 'active' }, { new: true, upsert: true }));
res.json({ success: true, data: subscription });
;
router.patch('/organizations/:id/deactivate', (0, express_async_handler_1.default)(async (req, res) => { const subscription = await Subscription_1.default.findOneAndUpdate(); }, { organizationId: req.params.id }, { status: 'inactive' }, { new: true }));
res.json({ success: true, data: subscription });
;
router.patch('/organizations/:id/grant-lifetime', (0, express_async_handler_1.default)(module_1.grantLifetimeAccess));
router.patch('/organizations/:id/revoke-lifetime', (0, express_async_handler_1.default)(module_1.revokeLifetimeAccess));
router.delete('/organizations/:orgId', (0, express_async_handler_1.default)(module_1.deleteOrganization));
router.put('/organizations/:orgId/subscription', (0, express_async_handler_1.default)(module_1.updateOrganizationSubscription));
router.put('/organizations/:orgId/toggle-self-deletion', (0, express_async_handler_1.default)(module_1.toggleSelfDeletion));
router.get('/users', async (req, res) => {
    try { }
    finally {
    }
    const users = await User_1.default.find({}).populate('organizationId', 'name');
    res.json({ success: true, data: users || [] });
});
try { }
catch (error) {
    console.error('Users fetch error:', error);
}
res.json({ success: true, data: [] });
;
router.put('/users/:userId/manage', (0, express_async_handler_1.default)(module_1.updateUserByAdmin));
router.delete('/users/:userId', (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findByIdAndDelete(req.params.userId);
    if (!user) { }
    res.status(404).json({ success: false, message: 'User not found' });
    return;
    res.json({ success: true, message: 'User deleted successfully' });
}));
router.post('/moderators', (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User_1.default.create({ name,
        email,
        password,
        role: 'Super Moderator',
        organizationId: req.user?.organizationId,
        isEmailVerified: true,
        status: 'active' });
}));
res.status(201).json({ success: true, data: user });
;
router.get('/moderators', (0, express_async_handler_1.default)(module_1.getModerators));
router.put('/moderators/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, status } = req.body;
    const user = await User_1.default.findByIdAndUpdate();
    req.params.id,
        { name, email, status: status === 'active' ? 'active' : 'suspended' },
        { new: true };
}));
if (!user) {
    res.status(404).json({ success: false, message: 'Moderator not found' });
    return;
    res.json({ success: true, data: user });
}
;
router.delete('/moderators/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findByIdAndDelete(req.params.id);
    if (!user) { }
    res.status(404).json({ success: false, message: 'Moderator not found' });
    return;
    res.json({ success: true, message: 'Moderator removed successfully' });
}));
router.get('/billing', async (req, res) => {
    try { }
    finally {
    }
    const activeSubscriptions = await Subscription_1.default.countDocuments({ status: 'active' });
    const allSubscriptions = await Subscription_1.default.find({ status: 'active' }).populate('planId');
    const totalRevenue = allSubscriptions.reduce((sum, sub) => { return sum + (sub.planId?.price || 0); });
}, 0);
const monthlyRevenue = Math.round(totalRevenue * 0.75);
const recentTransactions = await Subscription_1.default.find({ status: 'active' })
    .populate('organizationId', 'name')
    .populate('planId', 'name price')
    .sort({ createdAt: -1 })
    .limit(10)
    .then(subs => subs.map(sub => ({ _id: sub._id,
    organizationName: sub.organizationId?.name || 'Unknown',
    amount: sub.planId?.price || 0,
    status: 'completed',
    date: sub.createdAt || new Date(),
    planName: sub.planId?.name || 'Unknown Plan' })));
;
const revenueChart = [
    { month: 'Jan', revenue: Math.round(totalRevenue * 0.6), subscriptions: Math.round(activeSubscriptions * 0.7) },
    { month: 'Feb', revenue: Math.round(totalRevenue * 0.7), subscriptions: Math.round(activeSubscriptions * 0.8) },
    { month: 'Mar', revenue: Math.round(totalRevenue * 0.8), subscriptions: Math.round(activeSubscriptions * 0.9) },
    { month: 'Apr', revenue: Math.round(totalRevenue * 0.9), subscriptions: activeSubscriptions },
    { month: 'May', revenue: totalRevenue, subscriptions: activeSubscriptions },
    { month: 'Jun', revenue: Math.round(totalRevenue * 1.1), subscriptions: Math.round(activeSubscriptions * 1.1) }
];
const billingData = { totalRevenue: Math.round(totalRevenue / 100),
    monthlyRevenue: Math.round(monthlyRevenue / 100),
    activeSubscriptions,
    churnRate: 2.3,
    recentTransactions,
    revenueChart };
;
res.json({ success: true, data: billingData });
try { }
catch (error) {
    console.error('Billing data error:', error);
    res.json({}, success, true, data, { totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        recentTransactions: [],
        revenueChart: []
    });
}
;
router.get('/plans', async (req, res) => {
    try { }
    finally {
    }
    const plans = await Plan_1.default.find({}).sort({ price: 1 });
    res.json({ success: true, data: plans || [] });
});
try { }
catch (error) {
    console.error('Plans fetch error:', error);
}
res.json({ success: true, data: [] });
;
router.post('/plans', (0, express_async_handler_1.default)(async (req, res) => { const plan = await Plan_1.default.create(req.body); }, res.status(201).json({ success: true, data: plan })));
;
router.put('/plans/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const plan = await Plan_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) {
        res.status(404).json({ success: false, message: 'Plan not found' });
        return;
        res.json({ success: true, data: plan });
    }
}));
router.delete('/plans/:id', (0, express_async_handler_1.default)(async (req, res) => {
    const plan = await Plan_1.default.findByIdAndDelete(req.params.id);
    if (!plan) { }
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
    res.json({ success: true, message: 'Plan deleted successfully' });
}));
router.put('/users/:userId/plan', (0, express_async_handler_1.default)(async (req, res) => {
    const { planId } = req.body;
    const user = await User_1.default.findById(req.params.userId);
    if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
        const subscription = await Subscription_1.default.findOneAndUpdate();
        {
            organizationId: user.organizationId;
        }
        {
            planId, status;
            'active';
        }
        {
            new ;
            true, upsert;
            true;
        }
    }
}));
res.json({ success: true, data: subscription });
;
router.get('/all-maintenance-requests', (0, express_async_handler_1.default)(module_1.getAllMaintenanceRequests));
router.put('/site-content/:section', (0, express_async_handler_1.default)(module_1.updateSiteContent));
router.post('/plans-enhanced', (0, express_async_handler_1.default)(module_1.createPlan));
router.put('/plans-enhanced/:planId', (0, express_async_handler_1.default)(module_1.updatePlan));
router.delete('/plans-enhanced/:planId', (0, express_async_handler_1.default)(module_1.deletePlan));
router.get('/invites', (0, express_async_handler_1.default)(async (req, res) => {
    const invites = await User_1.default.find({ status: 'pending' }).populate('organizationId', 'name');
    res.json({ success: true, data: invites });
}));
router.get('/history', (0, express_async_handler_1.default)(async (req, res) => { const history = []; }, res.json({ success: true, data: history })));
;
router.get('/organization', (0, express_async_handler_1.default)(async (req, res) => {
    const orgs = await Organization_1.default.find({}).populate('owner', 'name email');
    res.json({ success: true, data: orgs });
}));
router.get('/email-status', (0, express_async_handler_1.default)(async (req, res) => {
    try { }
    finally {
    }
    const configured = !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
    res.json({ success: true,
        data: {},
        configured,
        status: configured ? 'operational' : 'not_configured'
    });
}));
try { }
catch (error) {
    res.json({}, success, false, data, { configured: false, status: 'error' });
}
;
;
router.get('/organization-by-code/:code', (0, express_async_handler_1.default)(async (req, res, next) => {
    try { }
    finally {
    }
    const organization = await Organization_1.default.findOne({ organizationCode: req.params.code })
        .select('name organizationCode')
        .populate('owner', 'name email');
    if (!organization) {
        res.status(404).json({ success: false, message: 'Organization not found' });
        return;
        res.json({ success: true, data: organization });
    }
    try { }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch organization' });
    }
}));
router.put('/site-settings', (0, express_async_handler_1.default)(async (req, res) => {
    try { }
    finally {
    }
    const settings = await SiteSettings_1.default.findOneAndUpdate();
    { }
    req.body,
        { new: true,
            upsert: true,
            runValidators: false };
}));
res.json({ success: true, data: settings, message: 'Settings saved successfully' });
try { }
catch (error) {
    console.error('Save settings error:', error);
}
res.status(500).json({ success: false, message: 'Failed to save settings', error: error.message });
;
const multer = require('multer');
const upload = multer({}, storage, multer.memoryStorage(), limits, { fileSize: 5 * 1024 * 1024 }, fileFilter, (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { }
    cb(null, true);
}, { cb(, Error) { } }('Only image files allowed'));
;
router.post('/upload-image', upload.single('image'), (0, express_async_handler_1.default)(async (req, res) => {
    try { }
    finally {
    }
    const mockImageUrl = `https://drive.google.com/uc?id=1234567890_${Date.now()}`;
}));
