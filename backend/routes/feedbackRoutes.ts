// backend/routes/feedbackRoutes.ts

import { Router } from 'express';
import { handleFeedbackSubmission } from '../controllers/feedbackController';

const router = Router();

// @route   POST /api/feedback
// @desc    Handles submission of the user feedback form
// @access  Public
router.post('/', handleFeedbackSubmission);

export default router;
