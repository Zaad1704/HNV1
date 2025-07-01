import { Router } from 'express';
import {
  getSubscriptionStatus,
  upgradePlan,
  cancelSubscription,
  reactivateSubscription,
  processPayment,
  getAvailablePlans,
  getBillingHistory,
  createCheckoutSession
} from '../controllers/subscriptionController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(protect);

// Subscription management
router.get('/status', getSubscriptionStatus);
router.post('/upgrade', authorize(['Landlord']), upgradePlan);
router.post('/cancel', authorize(['Landlord']), cancelSubscription);
router.post('/reactivate', authorize(['Landlord']), reactivateSubscription);

// Payment processing
router.post('/payment', authorize(['Landlord']), processPayment);
router.post('/checkout', authorize(['Landlord']), createCheckoutSession);

// Plans and billing
router.get('/plans', getAvailablePlans);
router.get('/billing-history', getBillingHistory);

export default router;