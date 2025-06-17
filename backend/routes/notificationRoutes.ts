import { Router } from 'express';
import { getNotifications, markNotificationsAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.post('/mark-as-read', markNotificationsAsRead);

export default router;
