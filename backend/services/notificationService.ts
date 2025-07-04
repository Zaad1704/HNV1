import { Notification } from '../models/Notification';

class NotificationService {
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    priority?: string;
  }) {
    try {
      const notification = new Notification({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        priority: data.priority || 'normal',
        isRead: false,
        createdAt: new Date()
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, limit = 20) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
      return notifications;
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }
}

export default new NotificationService();