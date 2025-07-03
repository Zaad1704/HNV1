"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.post('/send-rent-reminder', (0, express_async_handler_1.default)(async (req, res) => {
    const { tenantId } = req.body;
    if (!tenantId) {
        res.status(400).json({ success: false, message: 'Tenant ID is required' });
        return;
    }
    console.log(`Sending rent reminder to tenant: ${tenantId}`);
    res.json({
        success: true,
        message: 'Rent reminder sent successfully!'
    });
}));
router.post('/send-lease-renewal', (0, express_async_handler_1.default)(async (req, res) => {
    const { tenantId } = req.body;
    if (!tenantId) {
        res.status(400).json({ success: false, message: 'Tenant ID is required' });
        return;
    }
    console.log(`Sending lease renewal notice to tenant: ${tenantId}`);
    res.json({
        success: true,
        message: 'Lease renewal notice sent successfully!'
    });
}));
exports.default = router;
