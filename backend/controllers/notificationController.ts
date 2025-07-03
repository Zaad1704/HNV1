import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification';
import { generateSystemNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    // Generate fresh notifications before fetching
    if (req.user.organizationId) {
        await generateSystemNotifications(req.user.organizationId);
    }

    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    // Transform to match frontend interface
    const transformedNotifications = notifications.map(n => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.createdAt,
        read: n.isRead,
        link: n.link
    }));

    res.status(200).json({ success: true, data: transformedNotifications });
});

export const markNotificationAsReadHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    const { notificationId } = req.body;
    await markNotificationAsRead(notificationId, req.user._id);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
});

export const markAllNotificationsAsReadHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    await markAllNotificationsAsRead(req.user._id);
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
