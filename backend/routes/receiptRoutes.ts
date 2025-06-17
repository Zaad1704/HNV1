import { Router } from 'express';
import { generatePaymentReceipt } from '../controllers/receiptController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/payment/:paymentId', protect, authorize('Landlord', 'Agent'), generatePaymentReceipt);

export default router;
