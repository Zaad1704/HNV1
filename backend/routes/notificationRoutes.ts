import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

export default router;