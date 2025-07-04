import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getSubscriptionDetails,
  createCheckoutSession,
  getBillingHistory,
  subscribeToPlan,
  reactivateSubscription,
  cancelSubscription,
  getSubscriptionStatus
} from '../controllers/billingController';

const router = Router();

router.use(protect);

router.get('/subscription', getSubscriptionDetails);
router.post('/checkout', createCheckoutSession);
router.get('/history', getBillingHistory);
router.post('/subscribe', subscribeToPlan);
router.post('/reactivate', reactivateSubscription);
router.post('/cancel', cancelSubscription);
router.get('/status', getSubscriptionStatus);

export default router;
