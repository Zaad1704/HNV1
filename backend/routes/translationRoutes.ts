import { Router } from 'express';
import { translateContent } from '../controllers/translationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// This route is protected, so only logged-in users can use the translation service.
router.post('/', protect, translateContent);

export default router;
