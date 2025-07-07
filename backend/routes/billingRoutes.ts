import { Router } from 'express';
import { updateUserSubscription } from '../controllers/superAdminController';
import {
  getBillingInfo,
  updatePaymentMethod,
  changePlan,
  cancelSubscription
} from '../controllers/billingController';

const router = Router();

// User billing routes
router.get('/', getBillingInfo);
router.put('/payment-method', updatePaymentMethod);
router.put('/change-plan', changePlan);
router.post('/cancel', cancelSubscription);
router.put('/subscription', updateUserSubscription);

export default router;