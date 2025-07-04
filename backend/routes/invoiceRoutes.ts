import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getInvoices, generateInvoices, getInvoiceById, printInvoice, bulkDownloadInvoices, sendWhatsAppInvoice, sendEmailInvoice } from '../controllers/invoiceController';

const router = Router();

router.use(protect);

router.get('/', getInvoices);
router.post('/generate', generateInvoices);
router.get('/bulk-download', bulkDownloadInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/print', printInvoice);
router.get('/:id/pdf', printInvoice);
router.post('/:id/send-whatsapp', sendWhatsAppInvoice);
router.post('/:id/send-email', sendEmailInvoice);

export default router;
