import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrgUsers,
  getManagedAgents,
  updatePassword,
  requestAccountDeletion 
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// This applies the 'protect' middleware to all routes in this file,
// ensuring only authenticated users can access them.
router.use(protect);

// Route for the user to update their own password
router.put('/update-password', asyncHandler(updatePassword));

// Route for a user to request deletion of their own account/organization
router.post('/request-deletion', asyncHandler(requestAccountDeletion));

// Admin-only routes for managing all users
router.route('/')
  .get(authorize(['Super Admin']), asyncHandler(getUsers));

router
  .route('/:id')
  .get(authorize(['Super Admin']), asyncHandler(getUser))
  .put(authorize(['Super Admin']), asyncHandler(updateUser))
  .delete(authorize(['Super Admin']), asyncHandler(deleteUser));

// Routes for getting users within an organization context
router.get('/organization', authorize(['Super Admin', 'Landlord', 'Agent']), asyncHandler(getOrgUsers)); 
router.get('/my-agents', authorize(['Super Admin', 'Landlord']), asyncHandler(getManagedAgents));

export default router;
