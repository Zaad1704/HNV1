import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrgUsers,
  getManagedAgents
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(protect);

router.route('/').get(authorize(['Super Admin']), getUsers);

router
  .route('/:id')
  .get(authorize(['Super Admin']), getUser)
  .put(authorize(['Super Admin']), updateUser)
  .delete(authorize(['Super Admin']), deleteUser);

// Corrected route permissions
router.get('/organization', authorize(['Super Admin', 'Landlord', 'Agent']), getOrgUsers); 
router.get('/my-agents', authorize(['Super Admin', 'Landlord']), getManagedAgents);

export default router;
