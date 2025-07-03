import { Router } from 'express';
import { getNotifications, markNotificationAsReadHandler, markAllNotificationsAsReadHandler } from '../controllers/notificationController';

const router = Router();

router.get('/', getNotifications);
router.post('/mark-as-read', markNotificationAsReadHandler);
router.post('/mark-all-as-read', markAllNotificationsAsReadHandler);

export default router;
