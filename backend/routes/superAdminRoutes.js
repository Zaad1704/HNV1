"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/superAdminRoutes.ts
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
router.put('/organizations/:id/grant-lifetime', (0, express_async_handler_1.default)(superAdminController_1.grantLifetimeAccess));
router.put('/organizations/:id/revoke-lifetime', (0, express_async_handler_1.default)(superAdminController_1.revokeLifetimeAccess));
router.delete('/organizations/:orgId', (0, express_async_handler_1.default)(superAdminController_1.deleteOrganization)); // New Route
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
        isEmailVerified: true
    });
    res.status(201).json({ success: true, data: user });
}));
router.get('/moderators', (0, express_async_handler_1.default)(superAdminController_1.getModerators));
router.get('/billing', (0, express_async_handler_1.default)(superAdminController_1.getGlobalBilling));
router.get('/all-maintenance-requests', (0, express_async_handler_1.default)(superAdminController_1.getAllMaintenanceRequests));
exports.default = router;
//# sourceMappingURL=superAdminRoutes.js.map