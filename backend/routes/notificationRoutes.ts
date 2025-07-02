import { Router } from 'express';
import { getNotifications, markNotificationsAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Routes are protected by app.ts middleware

router.get('/', getNotifications);
router.post('/mark-as-read', markNotificationsAsRead);

export default router;
