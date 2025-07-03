"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.generateSystemNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const date_fns_1 = require("date-fns");
const createNotification = async (data) => {
    try {
        const notification = new Notification_1.default(data);
        await notification.save();
        return notification;
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
};
exports.createNotification = createNotification;
const generateSystemNotifications = async (organizationId) => {
    try {
        const User = require('../models/User');
        const users = await User.find({ organizationId, role: { $in: ['Landlord', 'Agent'] } });
        for (const user of users) {
            const lateTenants = await Tenant_1.default.find({
                organizationId,
                status: 'Late'
            }).populate('propertyId', 'name');
            if (lateTenants.length > 0) {
                await (0, exports.createNotification)({
                    userId: user._id,
                    organizationId,
                    type: 'warning',
                    title: 'Overdue Rent Payments',
                    message: `${lateTenants.length} tenant(s) have overdue rent payments`,
                    link: '/dashboard/tenants?filter=late'
                });
            }
            const thirtyDaysFromNow = (0, date_fns_1.addDays)(new Date(), 30);
            const expiringLeases = await Tenant_1.default.find({
                organizationId,
                leaseEndDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
                status: 'Active'
            }).populate('propertyId', 'name');
            if (expiringLeases.length > 0) {
                await (0, exports.createNotification)({
                    userId: user._id,
                    organizationId,
                    type: 'info',
                    title: 'Leases Expiring Soon',
                    message: `${expiringLeases.length} lease(s) expire within 30 days`,
                    link: '/dashboard/tenants?filter=expiring'
                });
            }
            const pendingMaintenance = await MaintenanceRequest_1.default.find({
                organizationId,
                status: 'Open'
            });
            if (pendingMaintenance.length > 0) {
                await (0, exports.createNotification)({
                    userId: user._id,
                    organizationId,
                    type: 'warning',
                    title: 'Pending Maintenance',
                    message: `${pendingMaintenance.length} maintenance request(s) need attention`,
                    link: '/dashboard/maintenance'
                });
            }
            const yesterday = (0, date_fns_1.addDays)(new Date(), -1);
            const recentPayments = await Payment_1.default.find({
                organizationId,
                paymentDate: { $gte: yesterday },
                status: 'Paid'
            }).populate('tenantId', 'name');
            if (recentPayments.length > 0) {
                await (0, exports.createNotification)({
                    userId: user._id,
                    organizationId,
                    type: 'success',
                    title: 'Recent Payments',
                    message: `${recentPayments.length} payment(s) received in the last 24 hours`,
                    link: '/dashboard/payments'
                });
            }
        }
    }
    catch (error) {
        console.error('Failed to generate system notifications:', error);
    }
};
exports.generateSystemNotifications = generateSystemNotifications;
const markNotificationAsRead = async (notificationId, userId) => {
    try {
        await Notification_1.default.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true });
    }
    catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (userId) => {
    try {
        await Notification_1.default.updateMany({ userId, isRead: false }, { isRead: true });
    }
    catch (error) {
        console.error('Failed to mark all notifications as read:', error);
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
