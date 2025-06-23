import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { generateInvoices } from '../controllers/invoiceController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

router.post('/generate', asyncHandler(generateInvoices)); 

export default router;
