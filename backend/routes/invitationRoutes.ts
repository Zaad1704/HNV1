import { Router } from 'express';
import {
  getInvitations,
  createInvitation,
  deleteInvitation,
  inviteTeamMember,
  getOrganizationCode,
  joinWithCode
} from '../controllers/invitationController';

const router = Router();

router.get('/', getInvitations);
router.post('/', createInvitation);
router.post('/invite', inviteTeamMember);
router.get('/org-code', getOrganizationCode);
router.post('/join', joinWithCode);
router.delete('/:id', deleteInvitation);

export default router;
