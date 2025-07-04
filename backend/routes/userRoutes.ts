import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getOrgUsers,
  getMyAgents,
  getInvites,
  inviteUser,
  updatePassword,
  requestAccountDeletion
} from '../controllers/userController';

const router = Router();

router.use(protect);

router.get('/', getUsers);
router.get('/organization', getOrgUsers);
router.get('/my-agents', getMyAgents);
router.get('/invites', getInvites);
router.post('/invite', inviteUser);
router.put('/password', updatePassword);
router.delete('/request-deletion', requestAccountDeletion);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;