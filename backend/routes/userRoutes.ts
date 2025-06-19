import { Router } from 'express';
// --- CORRECTED CONTROLLER IMPORTS ---
// The controller exports functions with these exact names.
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Apply authentication middleware to all routes in this file.
router.use(protect);

// --- CORRECTED ROUTE DEFINITIONS ---
// The 'authorize' function is now passed an array of strings.
// The controller function names are now correct.
router.route('/').get(authorize(['admin']), getAllUsers);

router
  .route('/:id')
  .get(authorize(['admin']), getUserById)
  .put(authorize(['admin']), updateUser)
  .delete(authorize(['admin']), deleteUser);

// This default export is correct.
export default router;
