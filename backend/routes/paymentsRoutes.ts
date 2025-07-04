import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { checkSubscriptionStatus } from '../middleware/subscriptionMiddleware';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/paymentsController';

const router = Router();

router.use(protect);
router.use(checkSubscriptionStatus);

router.get('/', getPayments);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

export default router;