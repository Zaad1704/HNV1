import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getPayments, createPayment } from '../controllers/paymentsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

router.use(protect);

router.route('/')
  .get(asyncHandler(getPayments))
  .post(asyncHandler(createPayment));

export default router;
