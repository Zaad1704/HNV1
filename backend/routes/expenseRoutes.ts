import { Router } from 'express';
import { getExpenses, createExpense } from '../controllers/expenseController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// CORRECTED: Added 'Super Admin' to the list of authorized roles
router.use(protect, authorize(['Super Admin', 'Landlord', 'Agent']));

router.route('/')
    .get(getExpenses)
    .post(upload.single('document'), createExpense);

export default router;
