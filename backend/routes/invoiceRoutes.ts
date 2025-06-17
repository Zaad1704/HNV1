import { Router } from 'express';
import { generateRentInvoice } from '../controllers/invoiceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/rent/:tenantId', protect, authorize('Landlord', 'Agent'), generateRentInvoice);

export default router;
