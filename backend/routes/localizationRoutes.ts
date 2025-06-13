import { Router } from 'express';
import { detectLocale } from '../controllers/localizationController';

const router = Router();

/**
 * @route   GET /api/localization/detect
 * @desc    Detects user's language and currency based on their IP address.
 * @access  Public
 */
router.get('/detect', detectLocale);

export default router;
