import { Router } from 'express';
import { getPayments, createPayment } from '../controllers/paymentsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Apply protection to all routes in this file
router.use(protect, authorize('Landlord', 'Agent'));

router.route('/')
  .get(getPayments)
  .post(createPayment); // <-- ADD THIS a

export default router;
