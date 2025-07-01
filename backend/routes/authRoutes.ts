import { Router } from 'express';
import passport from 'passport';
import asyncHandler from 'express-async-handler';
import { registerUser, loginUser, getMe, verifyEmail, googleAuthCallback, resendVerification, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { generateTwoFactorSecret, enableTwoFactor, verifyTwoFactor } from '../middleware/twoFactorAuth';
import { validate } from '../middleware/validateMiddleware';
import { registerSchema } from '../validators/userValidator';

const router = Router();

// Auth routes
router.post('/register', validate(registerSchema), asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.get('/me', protect, asyncHandler(getMe));
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/resend-verification', asyncHandler(resendVerification));
router.put('/profile', protect, asyncHandler(updateProfile));

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
        }
        const authenticator = passport.authenticate('google', {
            failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
            session: false
        });
        authenticator(req, res, next);
    },
    asyncHandler(googleAuthCallback)
);

// 2FA routes
router.post('/2fa/generate', protect, asyncHandler(generateTwoFactorSecret));
router.post('/2fa/enable', protect, asyncHandler(enableTwoFactor));
router.post('/2fa/verify', protect, asyncHandler(verifyTwoFactor));

export default router;