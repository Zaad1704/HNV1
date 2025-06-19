import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// --- Local Authentication Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);


// --- Google OAuth 2.0 Authentication Routes ---

// @desc    Initiate authentication with Google
// @route   GET /api/auth/google
// This is the route the frontend will redirect to when the "Sign in with Google" button is clicked.
router.get(
    '/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @desc    Google authentication callback URL
// @route   GET /api/auth/google/callback
// After the user authenticates with Google, Google redirects them back to this URL.
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // On successful authentication, a JWT is generated and sent to the user.
    // We redirect to a frontend page that will handle the token.
    if (req.user) {
        const token = (req.user as any).getSignedJwtToken();
        // Redirect with token. Frontend will save it and then redirect to the dashboard.
        res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } else {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

export default router;
