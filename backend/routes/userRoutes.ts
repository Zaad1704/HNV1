import { Router } from 'express';
// --- CORRECTED CONTROLLER IMPORTS ---
// The function names now match what is exported from the controller.
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
// --- CORRECTED MIDDLEWARE IMPORT ---
// Import 'authorize' from rbac.ts instead of 'admin' from a non-existent file.
import { authorize } from '../middleware/rbac';

const router = Router();

// This middleware will apply authentication to all routes in this file first.
router.use(authenticate);

// --- CORRECTED ROUTE DEFINITIONS ---
// The authorize middleware is now used correctly.
// The controller function names now match the corrected imports.
router.route('/').get(authorize('admin'), getAllUsers);

router
  .route('/:id')
  .get(authorize('admin'), getUserById)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

// This default export is correct.
export default router;
