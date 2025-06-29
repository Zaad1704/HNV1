"use strict";
// backend/routes/setupRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setupController_1 = require("../controllers/setupController"); // <-- Import new function
const router = (0, express_1.Router)();
// @route   POST /api/setup/create-super-admin
// @desc    A one-time use route to create the initial Super Admin account
// @access  Private (requires secret key)
router.post('/create-super-admin', setupController_1.createSuperAdmin);
// @route   POST /api/setup/create-default-plans
// @desc    A one-time use route to create the initial subscription plans
// @access  Private (requires secret key)
router.post('/create-default-plans', setupController_1.createDefaultPlans); // <-- Add this new route
exports.default = router;
//# sourceMappingURL=setupRoutes.js.map