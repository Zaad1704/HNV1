import { Router } from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Local Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Password Reset Routes
router.post('/forgotpassword', forgotPassword);
router.put('/passwordreset/:token', resetPassword);

// Google OAuth 2.0 Authentication Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = (req.user as any).getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

export default router;
