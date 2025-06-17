import { Router } from 'express';
import { getExpenses, createExpense } from '../controllers/expenseController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All expense routes are protected for Landlords/Agents
router.use(protect, authorize('Landlord', 'Agent'));

router.route('/')
    .get(getExpenses)
    .post(createExpense);

export default router;
