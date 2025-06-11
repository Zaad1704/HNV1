import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  // Assuming you will create these controller functions later
  // verifyInvite, 
  // acceptInvite
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', registerUser);

// @desc    Login a user
// @route   POST /api/auth/login
router.post('/login', loginUser);

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// Example routes for invitation flow (to be implemented)
// router.get('/verify-invite/:token', verifyInvite);
// router.post('/accept-invite/:token', acceptInvite);

export default router;
