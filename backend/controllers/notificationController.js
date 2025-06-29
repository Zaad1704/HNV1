"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationsAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const getNotifications = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const notifications = await Notification_1.default.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getNotifications = getNotifications;
const markNotificationsAsRead = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        await Notification_1.default.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
        res.status(200).json({ success: true, message: 'Notifications marked as read.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.markNotificationsAsRead = markNotificationsAsRead;
//# sourceMappingURL=notificationController.js.map