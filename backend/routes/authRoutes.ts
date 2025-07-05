import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  googleAuthCallback,
  updateProfile,
  changePassword,
  resendVerificationEmail,
  updateEmail,
  getVerificationStatus
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
router.put('/change-password', protect, changePassword);
router.post('/resend-verification', protect, resendVerificationEmail);
router.put('/update-email', protect, updateEmail);
router.get('/verification-status', protect, getVerificationStatus);

export default router;