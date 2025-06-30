"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const reminderController_1 = require("../controllers/reminderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.route('/')
    .post(authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(reminderController_1.createReminder))
    .get(authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent', 'Super Admin']), (0, express_async_handler_1.default)(reminderController_1.getReminders));
router.route('/:id')
    .put(authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(reminderController_1.updateReminder))
    .delete(authMiddleware_1.protect, (0, rbac_1.authorize)(['Landlord', 'Agent']), (0, express_async_handler_1.default)(reminderController_1.deleteReminder));
router.post('/process-overdue', (0, express_async_handler_1.default)(reminderController_1.processOverdueReminders));
exports.default = router;
