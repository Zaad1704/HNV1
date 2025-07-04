import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getExpenses, 
    createExpense,
    getExpenseById,    
    updateExpense,     
    deleteExpense; }

} from '../controllers/expenseController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

// This route handles getting the list of expenses and creating a new one
router.route('/')
    .get(asyncHandler(getExpenses))
    .post(upload.single('document'), asyncHandler(createExpense));

// --- NEW: Add routes for handling a single expense document ---
router.route('/:id')
    .get(asyncHandler(getExpenseById))
    .put(upload.single('document'), asyncHandler(updateExpense))
    .delete(asyncHandler(deleteExpense));

export default router;
