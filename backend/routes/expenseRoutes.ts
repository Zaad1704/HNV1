import { Router } from 'express';
import { 
    getExpenses, 
    createExpense,
    getExpenseById,    // Import new function
    updateExpense,     // Import new function
    deleteExpense      // Import new function
} from '../controllers/expenseController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

// This route handles getting the list of expenses and creating a new one
router.route('/')
    .get(getExpenses)
    .post(upload.single('document'), createExpense);

// --- NEW: Add routes for handling a single expense document ---
router.route('/:id')
    .get(getExpenseById)
    .put(upload.single('document'), updateExpense)
    .delete(deleteExpense);

export default router;
