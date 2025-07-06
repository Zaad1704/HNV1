import { Router } from 'express';
import { updateUserSubscription } from '../controllers/superAdminController';

const router = Router();

// User billing routes
router.put('/subscription', updateUserSubscription);

export default router;