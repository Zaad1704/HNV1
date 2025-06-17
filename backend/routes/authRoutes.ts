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
    // On successful authentication, req.user will be populated by Passport.js.
    // A developer would typically generate a JWT here and send it to the frontend.
    // For now, we will redirect the user to their dashboard.
    // NOTE: This assumes your frontend and backend are on the same domain or properly configured for cross-domain cookies.
    // A more common pattern is to redirect with the token in the URL query. e.g., res.redirect('https://your-frontend-url/auth/success?token=...');
    res.redirect('/dashboard');
  }
);

export default router;
