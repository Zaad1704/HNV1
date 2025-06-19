import { Router } from 'express';
import { generatePaymentReceipt } from '../controllers/receiptController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.get('/payment/:paymentId', protect, authorize(['Landlord', 'Agent']), generatePaymentReceipt);

export default router;
