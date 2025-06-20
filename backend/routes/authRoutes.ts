// backend/routes/authRoutes.ts
import { Router } from "express";
import passport from 'passport';
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

// Standard Auth
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Google OAuth Routes
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
    googleAuthCallback
);

export default router;
