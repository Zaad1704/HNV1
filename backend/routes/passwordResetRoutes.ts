import { Router } from 'express';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController';

const router = Router();

router.post('/forgot', forgotPassword);
router.put('/reset/:resetToken', resetPassword);

export default router;
