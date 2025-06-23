import { Request, Response } from 'express'; 
import Notification from '../models/Notification';

export const getNotifications = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    try {
        const notifications = await Notification.find({ userId: req.user._id }) 
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const markNotificationsAsRead = async (req: Request, res: Response) => {
     if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
     }

    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false }, 
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
