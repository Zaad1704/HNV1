import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController';

const router = Router();

router.post('/forgot', asyncHandler(forgotPassword));
router.put('/reset/:resetToken', asyncHandler(resetPassword));

export default router;
