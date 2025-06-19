import { Router } from 'express';
import { inviteAgent, getInvitationDetails, acceptAgentInvitation } from '../controllers/invitationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.post('/invite-agent', protect, authorize(['Landlord']), inviteAgent);

router.get('/accept/:token', getInvitationDetails);
router.post('/accept/:token', acceptAgentInvitation);

export default router;
