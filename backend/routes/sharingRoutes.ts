import { Router } from 'express';
import { createShareLink, viewSharedDocument } from '../controllers/sharingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Endpoint to create a share link (requires user to be logged in)
router.post('/expense-document/:expenseId', protect, createShareLink);

// Public endpoint for anyone with the token to view the document
router.get('/view/:token', viewSharedDocument);

export default router;
