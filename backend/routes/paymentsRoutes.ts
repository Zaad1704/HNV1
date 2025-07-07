import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { checkSubscriptionStatus } from '../middleware/subscriptionMiddleware';
import { auditLog } from '../middleware/auditMiddleware';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} from '../controllers/paymentsController';

const router = Router();

// Protection handled at app level

router.get('/', getPayments);
router.post('/', auditLog('payment_created', 'payment'), createPayment);
router.put('/:id', auditLog('payment_updated', 'payment'), updatePayment);
router.delete('/:id', auditLog('payment_deleted', 'payment'), deletePayment);

export default router;