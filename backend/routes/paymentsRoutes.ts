import { Router } from 'express';
import { getPayments, createPayment } from '../controllers/paymentsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.use(protect, authorize(['Landlord', 'Agent']));

router.route('/')
  .get(getPayments)
  .post(createPayment);

export default router;
