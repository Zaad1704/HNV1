import { Router } from 'express';
import passport from 'passport';
import asyncHandler from 'express-async-handler';
import { registerUser, loginUser, getMe, verifyEmail, googleAuthCallback, resendVerification, updateProfile } from '../controllers/authController';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController';
import { protect } from '../middleware/authMiddleware';
import { generateTwoFactorSecret, enableTwoFactor, verifyTwoFactor } from '../middleware/twoFactorAuth';
import { validate } from '../middleware/validateMiddleware';
import { registerSchema } from '../validators/userValidator';

const router = Router();

// Auth routes
router.post('/register', validate(registerSchema), registerUser as any);
router.post('/login', loginUser as any);
router.get('/me', protect, getMe as any);
router.get('/verify-email/:token', verifyEmail as any);
router.post('/resend-verification', resendVerification as any);
router.post('/forgot-password', forgotPassword as any);
router.put('/reset-password/:resetToken', resetPassword as any);
router.put('/profile', protect, updateProfile as any);

// Google OAuth
router.get('/google', (req, res, next) => {
    const role = req.query.role || 'Landlord';
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');
    const authenticator = passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state,
    });
    authenticator(req, res, next);
});

router.get('/google/callback', 
    (req, res, next) => {
        const state = req.query.state as string;
        if (state) {
            const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
            (req as any).authRole = decodedState.role;

        const authenticator = passport.authenticate('google', {
            failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed