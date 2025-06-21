import { Router } from 'express';
// Corrected: Import 'inviteUser' instead of 'inviteAgent'
import { inviteUser, getInvitationDetails, acceptInvitation } from '../controllers/invitationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

// Corrected: This single route now uses the generic 'inviteUser' function
// and is accessible by both Landlords and Agents.
router.post('/invite-user', protect, authorize(['Landlord', 'Agent']), inviteUser);

// Routes for accepting the invitation remain the same
router.get('/accept/:token', getInvitationDetails);
router.post('/accept/:token', acceptInvitation);

export default router;
