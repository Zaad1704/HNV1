import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.use(protect);

// Note: The 'authorize' middleware now correctly expects an array of roles.
router.route('/').get(authorize(['Super Admin']), getUsers); // Example: Only Super Admins can get all users

router
  .route('/:id')
  .get(authorize(['Super Admin']), getUser)
  .put(authorize(['Super Admin']), updateUser)
  .delete(authorize(['Super Admin']), deleteUser);

export default router;
