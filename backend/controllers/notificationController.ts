import { Request, Response } from 'express'; // FIX: Import Request
// FIX: AuthenticatedRequest is no longer needed.
import Notification from '../models/Notification';

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
export const getNotifications = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const notifications = await Notification.find({ userId: req.user._id }) // FIX: Use _id
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark notifications as read
// @route   POST /api/notifications/mark-as-read
export const markNotificationsAsRead = async (req: Request, res: Response) => { // FIX: Use Request
     if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false }, // FIX: Use _id
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true, message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
