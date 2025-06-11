import { Router } from 'express';
import {
  getProfile,
  updateUserDetails,
  updateUserPassword
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

// Route to get the current user's profile information
router.get('/profile', getProfile);

// Route to update the user's name or other details
router.put('/updatedetails', updateUserDetails);

// Route to update the user's password
router.put('/updatepassword', updateUserPassword);

export default router;
