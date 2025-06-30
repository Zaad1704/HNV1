"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setupController_1 = require("../controllers/setupController");
const router = (0, express_1.Router)();
router.post('/create-super-admin', setupController_1.createSuperAdmin);
router.post('/create-default-plans', setupController_1.createDefaultPlans);
exports.default = router;
