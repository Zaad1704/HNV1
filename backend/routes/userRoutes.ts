import { Router } from 'express';
import {
  getProfile,
  updateUserDetails,
  updateUserPassword,
  requestDataExport,
  requestAccountDeletion,
  getOrganizationUsers,
  updateOrganizationBranding // Import the new function
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are protected and require a user to be logged in.
router.use(protect);

// Route to get all users in the same organization
router.get('/organization', getOrganizationUsers);

// Add the new route to update organization branding
router.put('/organization/branding', updateOrganizationBranding);

// Route to get the current user's profile information
router.get('/profile', getProfile);

// Route to update the user's name or other details
router.put('/updatedetails', updateUserDetails);

// Route to update the user's password
router.put('/updatepassword', updateUserPassword);

// Routes for data management and account deletion
router.post('/request-data-export', requestDataExport);
router.post('/request-account-deletion', requestAccountDeletion);

export default router;
