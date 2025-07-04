"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const tenantsController_1 = require("../controllers/tenantsController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(tenantsController_1.getTenants)
    .post(tenantsController_1.createTenant);
router.route('/:id')
    .get(tenantsController_1.getTenantById)
    .put(tenantsController_1.updateTenant)
    .delete(tenantsController_1.deleteTenant);
exports.default = router;
