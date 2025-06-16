import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
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

export default router;
