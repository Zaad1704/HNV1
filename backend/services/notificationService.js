"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationService {
    /**
     * Creates a notification for a specific user.
     * @param userId The ID of the user to notify.
     * @param organizationId The organization the notification belongs to.
     * @param message The notification message.
     * @param link The relative link for the frontend (e.g., '/dashboard/maintenance').
     */
    async createNotification(userId, organizationId, message, link) {
        try {
            await Notification_1.default.create({
                userId,
                organizationId,
                message,
                link,
            });

        catch (error) {
            console.error('Failed to create notification:', error);



exports.default = new NotificationService();
//# sourceMappingURL=notificationService.js.map