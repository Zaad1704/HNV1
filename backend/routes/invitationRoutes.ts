import { Router } from 'express';
// Correctly import 'acceptInvitation' instead of 'acceptAgentInvitation'
import { inviteAgent, getInvitationDetails, acceptInvitation } from '../controllers/invitationController';
import { protect } from '../middleware/authMiddleware';
// Assuming your rbac middleware is correctly located here
import { authorize } from '../middleware/rbac'; 

const router = Router();

// Invite an agent (only for Landlords)
router.post('/invite-agent', protect, authorize(['Landlord']), inviteAgent);

// Get the details for an invitation page
router.get('/accept/:token', getInvitationDetails);

// Post to the same URL to accept the invitation
router.post('/accept/:token', acceptInvitation);

export default router;
