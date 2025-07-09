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
router.post('/', auditLog('payment'), createPayment);
router.put('/:id', auditLog('payment'), updatePayment);
router.delete('/:id', auditLog('payment'), deletePayment);

// Get payments by property and month
router.get('/property/:propertyId/month/:month', async (req: any, res) => {
  try {
    const { propertyId, month } = req.params;
    
    const Payment = require('../models/Payment').default;
    const payments = await Payment.find({
      propertyId,
      rentMonth: month,
      organizationId: req.user.organizationId
    }).populate('tenantId', 'name unit');
    
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;