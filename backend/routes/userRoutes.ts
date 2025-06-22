import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrgUsers,
  getManagedAgents,
  updatePassword // Import the new controller
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(protect);

// Add this new route for password updates
router.put('/update-password', updatePassword);

router.route('/').get(authorize(['Super Admin']), getUsers);

router
  .route('/:id')
  .get(authorize(['Super Admin']), getUser)
  .put(authorize(['Super Admin']), updateUser)
  .delete(authorize(['Super Admin']), deleteUser);

router.get('/organization', authorize(['Super Admin', 'Landlord', 'Agent']), getOrgUsers); 
router.get('/my-agents', authorize(['Super Admin', 'Landlord']), getManagedAgents);

export default router;
