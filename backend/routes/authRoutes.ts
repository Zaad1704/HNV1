import { Router, Request } from 'express';
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
    (req: Request, res, next) => {
        const role = req.query.role || 'Landlord'; // Default to Landlord if not provided
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
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
        // Attach decoded role to the request object to be used in the passport callback
        (req as any).authRole = decodedState.role;
        
        const authenticator = passport.authenticate('google', {
            failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`,
            session: false
        });
        authenticator(req, res, next);
    },
    asyncHandler(googleAuthCallback) 
);

export default router;
