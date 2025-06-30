"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationService {
    async createNotification(userId, organizationId, message, link) {
        try {
            await Notification_1.default.create({
                userId,
                organizationId,
                message,
                link,
            });
            console.log(`Notification created for user ${userId}: "${message}"`);
        }
        catch (error) {
            console.error('Failed to create notification:', error);
        }
    }
}
exports.default = new NotificationService();
