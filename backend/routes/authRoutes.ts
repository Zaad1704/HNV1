import { Router } from 'express';
import passport from 'passport';
import asyncHandler from 'express-async-handler'; 
import {
    registerUser,
    loginUser,
    getMe,
    googleAuthCallback
} from '../controllers/authController';
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import { registerSchema } from "../validators/userValidator";

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.get('/me', protect, asyncHandler(getMe));

// Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
        session: false
    }),
    asyncHandler(googleAuthCallback) 
);

export default router;
