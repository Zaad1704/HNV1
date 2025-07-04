import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getSubscriptionDetails,
  createCheckoutSession,
  getBillingHistory
} from '../controllers/billingController';

const router = Router();

router.use(protect);

router.get('/subscription', getSubscriptionDetails);
router.post('/checkout', createCheckoutSession);
router.get('/history', getBillingHistory);

export default router;
