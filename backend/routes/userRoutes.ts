import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
// Assuming you have an admin middleware, if not, you might need to adjust this
import { admin } from '../middleware/adminMiddleware'; 

const router = Router();

// This middleware will apply protection and admin checks to all routes in this file
router.use(protect, admin);

router.route('/').get(getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// --- CORRECTED LINE ---
// Changed from a named export to a default export for consistency.
export default router;
