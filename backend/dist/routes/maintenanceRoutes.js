"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const maintenanceController_1 = require("../controllers/maintenanceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .post((0, express_async_handler_1.default)(maintenanceController_1.createMaintenanceRequest))
    .get((0, express_async_handler_1.default)(maintenanceController_1.getOrgMaintenanceRequests));
router.route('/:id')
    .get((0, express_async_handler_1.default)(maintenanceController_1.getMaintenanceRequestById))
    .put((0, express_async_handler_1.default)(maintenanceController_1.updateMaintenanceRequest))
    .delete((0, express_async_handler_1.default)(maintenanceController_1.deleteMaintenanceRequest));
exports.default = router;
