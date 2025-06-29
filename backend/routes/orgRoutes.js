"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/orgRoutes.ts
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const orgController_1 = require("../controllers/orgController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Apply protect middleware to all routes in this file
router.use(authMiddleware_1.protect);
// @route   GET /api/orgs/me
// @desc    Get details for the logged-in user's organization
// @access  Private (Landlord, Agent, Tenant - depending on what details are shared)
router.get('/me', (0, express_async_handler_1.default)(orgController_1.getOrganizationDetails));
// @route   GET /api/orgs
// @desc    List all organizations (Super Admin only)
// @access  Private (Super Admin)
router.get('/', (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(orgController_1.listOrganizations));
// @route   PUT /api/orgs/:id/status
// @desc    Set organization status (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/status', (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(orgController_1.setOrgStatus));
exports.default = router;
//# sourceMappingURL=orgRoutes.js.map