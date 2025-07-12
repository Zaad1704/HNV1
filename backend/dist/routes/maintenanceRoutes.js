"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const maintenanceController_1 = require("../controllers/maintenanceController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(maintenanceController_1.getMaintenanceRequests)
    .post(maintenanceController_1.createMaintenanceRequest);
router.route('/:id')
    .get(maintenanceController_1.getMaintenanceRequestById)
    .put(maintenanceController_1.updateMaintenanceRequest)
    .delete(maintenanceController_1.deleteMaintenanceRequest);
exports.default = router;
