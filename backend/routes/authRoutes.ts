import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middleware/authMiddleware';
import { generateTwoFactorSecret, enableTwoFactor, verifyTwoFactor } from '../middleware/twoFactorAuth';

const router = Router();

// 2FA routes
router.post('/2fa/generate', protect, asyncHandler(generateTwoFactorSecret));
router.post('/2fa/enable', protect, asyncHandler(enableTwoFactor));
router.post('/2fa/verify', protect, asyncHandler(verifyTwoFactor));

export default router;