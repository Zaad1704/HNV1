"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsReadHandler = exports.markNotificationAsReadHandler = exports.getNotifications = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Notification_1 = __importDefault(require("../models/Notification"));
const notificationService_1 = require("../services/notificationService");
exports.getNotifications = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    if (req.user.organizationId) {
        await (0, notificationService_1.generateSystemNotifications)(req.user.organizationId);
        const notifications = await Notification_1.default.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        const transformedNotifications = notifications.map(n => ({ id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.createdAt,
            read: n.isRead,
            link: n.link }));
    }
});
res.status(200).json({ success: true, data: transformedNotifications });
;
exports.markNotificationAsReadHandler = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    const { notificationId } = req.body;
    await (0, notificationService_1.markNotificationAsRead)(notificationId, req.user._id);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
});
exports.markAllNotificationsAsReadHandler = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    await (0, notificationService_1.markAllNotificationsAsRead)(req.user._id);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
