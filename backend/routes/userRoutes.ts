import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrgUsers,
  getManagedAgents,
  updatePassword // This import will now work
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(protect);

router.put('/update-password', updatePassword); // The route for the new function

router.route('/').get(authorize(['Super Admin']), getUsers);

router
  .route('/:id')
  .get(authorize(['Super Admin']), getUser)
  .put(authorize(['Super Admin']), updateUser)
  .delete(authorize(['Super Admin']), deleteUser);

router.get('/organization', authorize(['Super Admin', 'Landlord', 'Agent']), getOrgUsers); 
router.get('/my-agents', authorize(['Super Admin', 'Landlord']), getManagedAgents);

export default router;
