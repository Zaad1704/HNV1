import { Router } from 'express';
import { generateInvoices } from '../controllers/invoiceController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

router.post('/generate', generateInvoices); // FIX: Corrected function name

export default router;
