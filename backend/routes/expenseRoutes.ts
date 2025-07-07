import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { requireApproval } from '../middleware/approvalMiddleware';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(requireApproval('expense'), createExpense);

router.route('/:id')
  .put(requireApproval('expense'), updateExpense)
  .delete(requireApproval('expense'), deleteExpense);

export default router;
