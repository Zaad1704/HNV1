import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  googleAuthCallback,
  updateProfile
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import passport from 'passport';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  googleAuthCallback
);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;