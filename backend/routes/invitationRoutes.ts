import { Router } from 'express';
import {
  getInvitations,
  createInvitation,
  deleteInvitation
} from '../controllers/invitationController';

const router = Router();

router.get('/', getInvitations);
router.post('/', createInvitation);
router.delete('/:id', deleteInvitation);

export default router;
