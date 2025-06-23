import { Router } from 'express';
import { 
    inviteUser, 
    getInvitationDetails, 
    acceptInvitation,
    getPendingInvitations, // <-- Import new function
    revokeInvitation,      // <-- Import new function
    resendInvitation       // <-- Import new function
} from '../controllers/invitationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

// --- Existing Routes ---
router.post('/invite-user', protect, authorize(['Landlord', 'Agent']), inviteUser);
router.get('/accept/:token', getInvitationDetails);
router.post('/accept/:token', acceptInvitation);

// --- NEW ROUTES for managing invitations ---
router.get('/pending', protect, authorize(['Landlord', 'Agent']), getPendingInvitations);
router.post('/:id/revoke', protect, authorize(['Landlord', 'Agent']), revokeInvitation);
router.post('/:id/resend', protect, authorize(['Landlord', 'Agent']), resendInvitation);


export default router;
