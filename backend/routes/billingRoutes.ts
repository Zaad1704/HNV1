import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getSubscriptionDetails,
  createCheckoutSession,
  getBillingHistory,
  subscribeToPlan
} from '../controllers/billingController';

const router = Router();

router.use(protect);

router.get('/subscription', getSubscriptionDetails);
router.post('/checkout', createCheckoutSession);
router.get('/history', getBillingHistory);
router.post('/subscribe', subscribeToPlan);

export default router;
