import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getStatus } from '../controllers/subscriptionController';

const router = Router();

router.get('/status', protect, getStatus);

export default router;
