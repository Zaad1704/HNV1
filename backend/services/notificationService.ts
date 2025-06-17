import Notification from '../models/Notification';
import mongoose from 'mongoose';

class NotificationService {
  /**
   * Creates a notification for a specific user.
   * @param userId The ID of the user to notify.
   * @param organizationId The organization the notification belongs to.
   * @param message The notification message.
   * @param link The relative link for the frontend (e.g., '/dashboard/maintenance').
   */
  async createNotification(
    userId: mongoose.Types.ObjectId,
    organizationId: mongoose.Types.ObjectId,
    message: string,
    link: string
  ) {
    try {
      await Notification.create({
        userId,
        organizationId,
        message,
        link,
      });
      console.log(`Notification created for user ${userId}: "${message}"`);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }
}

export default new NotificationService();
