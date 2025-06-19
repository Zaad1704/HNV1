import { Router } from 'express';
import { getExpenses, createExpense } from '../controllers/expenseController';
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; // Import the upload middleware

const router = Router();

router.use(protect, authorize('Landlord', 'Agent'));

// The GET route remains the same
router.route('/')
    .get(getExpenses)
    // The POST route now uses the upload middleware to handle a single file upload
    // 'document' is the name of the file input field on the frontend form
    .post(upload.single('document'), createExpense);

export default router;
