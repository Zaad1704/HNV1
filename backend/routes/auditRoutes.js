"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const router = require('express').Router();
router.use(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));
router.get('/', (0, express_async_handler_1.default)(async (req, res) => {
    // FIX: The incorrect type cast has been removed from this line.
    const authenticatedUser = req.user;
    const { userId, action, startDate, endDate } = req.query;
    const query = {
        organizationId: authenticatedUser?.organizationId
    };
    if (userId) {
        query.user = userId;
    }
    if (action) {
        query.action = { $regex: action, $options: 'i' };
    }
    if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const logs = await AuditLog_1.default.find(query)
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .limit(200);
    res.status(200).json({ success: true, data: logs });
}));
exports.default = router;
//# sourceMappingURL=auditRoutes.js.map