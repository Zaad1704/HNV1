// backend/routes/subscriptionsRoutes.ts

import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware';
import { getBillingHistory, getPlans, subscribe } from '../controllers/billingController';

const router = Router();

// Protect all routes in this file
router.use(protect);

// Routes for subscription management
router.get('/', getBillingHistory);
router.get('/plans', getPlans);
router.post('/subscribe', authorize('Landlord', 'Super Admin'), subscribe);

export default router;
