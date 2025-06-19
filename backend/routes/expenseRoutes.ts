import { Router } from 'express';
import { getExpenses, createExpense } from '../controllers/expenseController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect, authorize(['Landlord', 'Agent']));

router.route('/')
    .get(getExpenses)
    .post(upload.single('document'), createExpense);

export default router;
