import { Router } from 'express';
import { inviteAgent, getInvitationDetails, acceptAgentInvitation } from '../controllers/invitationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// A Landlord must be logged in to send an invitation
router.post('/invite-agent', protect, authorize('Landlord'), inviteAgent);

// These routes are public for the recipient to use the token
router.get('/accept/:token', getInvitationDetails);
router.post('/accept/:token', acceptAgentInvitation);

export default router;
