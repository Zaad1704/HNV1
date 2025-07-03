import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { 
    inviteUser, 
    getInvitationDetails, 
    acceptInvitation,
    getPendingInvitations, 
    revokeInvitation,      
    resendInvitation       
} from '../controllers/invitationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

// --- Existing Routes ---
router.post('/invite-user', protect, authorize(['Landlord', 'Agent']), asyncHandler(inviteUser));
router.get('/accept/:token', asyncHandler(getInvitationDetails));
router.post('/accept/:token', asyncHandler(acceptInvitation));

// --- NEW ROUTES for managing invitations ---
router.get('/pending', protect, authorize(['Landlord', 'Agent']), asyncHandler(getPendingInvitations));
router.post('/:id/revoke', protect, authorize(['Landlord', 'Agent']), asyncHandler(revokeInvitation));
router.post('/:id/resend', protect, authorize(['Landlord', 'Agent']), asyncHandler(resendInvitation));

export default router;
