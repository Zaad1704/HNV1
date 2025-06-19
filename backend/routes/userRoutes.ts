import { Router } from 'express';
// --- CORRECTED CONTROLLER IMPORTS ---
// The controller actually exports 'getUsers', 'getUser', etc.
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
// --- CORRECTED MIDDLEWARE IMPORT ---
// The auth middleware exports a function named 'protect'.
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// This middleware will apply authentication to all routes in this file.
// The function is named 'protect', not 'authenticate'.
router.use(protect);

// --- CORRECTED ROUTE DEFINITIONS ---
// The 'authorize' function takes its arguments as a list, not a single string.
router.route('/').get(authorize('admin'), getUsers);

router
  .route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

// This default export is correct.
export default router;
