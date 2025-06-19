import { Router } from 'express';
// --- CORRECTED CONTROLLER IMPORTS ---
// The function names now match what is actually exported from the controller.
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Apply authentication middleware to all routes in this file.
router.use(protect);

// --- CORRECTED ROUTE DEFINITIONS ---
// The controller function names now match the corrected imports.
// The authorize function is called correctly with an array.
router.route('/').get(authorize(['admin']), getUsers);

router
  .route('/:id')
  .get(authorize(['admin']), getUser)
  .put(authorize(['admin']), updateUser)
  .delete(authorize(['admin']), deleteUser);

// This default export is correct.
export default router;
