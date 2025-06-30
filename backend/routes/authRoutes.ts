import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import asyncHandler from 'express-async-handler'; 
import {
    registerUser,
    loginUser,
    getMe,
    googleAuthCallback,
    verifyEmail,
    updateProfile,
    resendVerification
} from '../controllers/authController';
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { registerSchema } from "../validators/userValidator";

const router = Router();

// FIX: Correctly cast the asyncHandler to the Express RequestHandler type to resolve TS errors
router.post('/register', validate(registerSchema), asyncHandler(registerUser as any));
router.post('/login', asyncHandler(loginUser as any));
router.get('/me', protect, asyncHandler(getMe as any));
router.get('/verify-email/:token', asyncHandler(verifyEmail as any));
router.post('/resend-verification', asyncHandler(resendVerification as any));
router.put('/profile', protect, asyncHandler(updateProfile as any));

// Google OAuth
router.get(
    '/google',
    (req: Request, res, next) => {
        const role = req.query.role || 'Landlord';
        const state = Buffer.from(JSON.stringify({ role })).toString('base64');
        const authenticator = passport.authenticate('google', {
            scope: ['profile', 'email'],
            state: state,
        });
        authenticator(req, res, next);
    }
);

router.get(
    '/google/callback',
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
    asyncHandler(googleAuthCallback as any) 
);

export default router;
