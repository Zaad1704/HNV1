import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getInvoices, generateInvoices, getInvoiceById, printInvoice } from '../controllers/invoiceController';

const router = Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/generate', generateInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/print', printInvoice);

export default router;
