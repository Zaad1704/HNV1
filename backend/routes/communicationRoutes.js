"use strict";
// backend/routes/communicationRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const communicationController_1 = require("../controllers/communicationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Route for sending custom emails
router.post('/email', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(communicationController_1.sendCustomEmail));
// NEW ROUTE for C.1: Send Rent Reminder
router.post('/send-rent-reminder', authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(communicationController_1.sendRentReminder));
exports.default = router;
//# sourceMappingURL=communicationRoutes.js.map