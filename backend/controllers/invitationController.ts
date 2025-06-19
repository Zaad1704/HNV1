import { Request, Response } from 'express';
// FIX: AuthenticatedRequest is no longer needed.
import User from '../models/User';
import AgentInvitation from '../models/AgentInvitation';
import emailService from '../services/emailService';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

// @desc    Invite an Agent to a Landlord's organization
// @route   POST /api/invitations/invite-agent
export const inviteAgent = async (req: Request, res: Response) => { // FIX: Use Request
    const { recipientEmail } = req.body;
    const inviter = req.user;

    if (!inviter || inviter.role !== 'Landlord') {
        return res.status(403).json({ success: false, message: 'Only Landlords can invite agents.' });
    }
    if (!recipientEmail) {
        return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }

    try {
        // --- NEW: Check subscription limits ---
        const subscription = await Subscription.findOne({ organizationId: inviter.organizationId }).populate('planId');
        if (!subscription || !subscription.planId) {
            return res.status(403).json({ success: false, message: 'No valid subscription found.' });
        }
        const plan = subscription.planId as any; // Cast to access limits
        if (inviter.managedAgentIds.length >= plan.limits.maxAgents) {
            return res.status(403).json({ success: false, message: `You have reached the maximum of ${plan.limits.maxAgents} agents for your current plan.` });
        }
        // --- End of subscription check ---

        const existingUser = await User.findOne({ email: recipientEmail });
        if (existingUser && existingUser.organizationId.toString() === inviter.organizationId.toString()) {
            return res.status(400).json({ success: false, message: 'This user is already part of your organization.' });
        }
        
        const pendingInvite = await AgentInvitation.findOne({ recipientEmail, organizationId: inviter.organizationId, status: 'pending' });
        if (pendingInvite) {
            return res.status(400).json({ success: false, message: 'This user already has a pending invitation.' });
        }

        const invitation = await AgentInvitation.create({
            organizationId: inviter.organizationId,
            inviterId: inviter._id,
            recipientEmail,
        });
        
        const acceptURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-agent-invite/${invitation.token}`;

        await emailService.sendEmail(
            recipientEmail,
            `Invitation to join ${inviter.name}'s Team on HNV`,
            'agentInvitation',
            {
                inviterName: inviter.name,
                acceptURL: acceptURL,
            }
        );

        res.status(201).json({ success: true, message: `Invitation sent to ${recipientEmail}.` });

    } catch (error) {
        console.error("Error inviting agent:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// We will implement the acceptance logic in a later step
export const getInvitationDetails = async (req: Request, res: Response) => { /* Placeholder */ };
export const acceptAgentInvitation = async (req: Request, res: Response) => { /* Placeholder */ };
