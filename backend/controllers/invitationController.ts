import { Response } from 'express';
import AgentInvitation from '../models/AgentInvitation';
import User from '../models/User';
import Property from '../models/Property';
import emailService from '../services/emailService';
import { addDays } from 'date-fns';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// inviteUser, getInvitationDetails, acceptInvitation functions remain the same...
export const inviteUser = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };
export const getInvitationDetails = async (req: Request, res: Response) => { /* ... */ };
export const acceptInvitation = async (req: Request, res: Response) => { /* ... */ };


// --- NEW FUNCTION: Get all pending invitations for an organization ---
export const getPendingInvitations = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const invitations = await AgentInvitation.find({ 
        organizationId: req.user.organizationId,
        status: 'pending' 
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: invitations });
};

// --- NEW FUNCTION: Revoke a pending invitation ---
export const revokeInvitation = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const { id } = req.params;
    const invitation = await AgentInvitation.findOne({ _id: id, organizationId: req.user.organizationId });

    if (!invitation) {
        return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }
    
    await invitation.deleteOne();
    res.status(200).json({ success: true, message: 'Invitation revoked successfully.' });
};

// --- NEW FUNCTION: Resend a pending invitation ---
export const resendInvitation = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const { id } = req.params;
    const invitation = await AgentInvitation.findOne({ _id: id, organizationId: req.user.organizationId }).populate('inviterId', 'name');

    if (!invitation) {
        return res.status(404).json({ success: false, message: 'Invitation not found.' });
    }
    if (invitation.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'This invitation cannot be resent.' });
    }

    // Extend the expiration date by another 7 days
    invitation.expiresAt = addDays(new Date(), 7);
    await invitation.save();

    // Resend the email
    const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${invitation.token}`;
    await emailService.sendEmail(
        invitation.recipientEmail, 
        `Invitation to join ${(invitation.inviterId as any)?.name}'s Team`, 
        'agentInvitation', 
        { inviterName: (invitation.inviterId as any)?.name, acceptURL }
    );

    res.status(200).json({ success: true, message: 'Invitation resent successfully.' });
};
