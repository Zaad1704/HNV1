import { Router } from 'express';
import { getPayments } from '../controllers/paymentsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures only authenticated users can view payment records.
router.use(protect);

// Route for getting all payments for the user's organization
router.route('/')
  .get(getPayments);

// In a future update, a developer would add routes here for creating
// and managing individual payment records. For example:
// router.route('/:id').get(getPaymentById);
// router.route('/').post(createPayment);

export default router;
