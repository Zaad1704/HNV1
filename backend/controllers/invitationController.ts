import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../models/User';
import AgentInvitation from '../models/AgentInvitation';
import emailService from '../services/emailService';

// @desc    Invite an Agent to a Landlord's organization
// @route   POST /api/invitations/invite-agent
export const inviteAgent = async (req: AuthenticatedRequest, res: Response) => {
    const { recipientEmail } = req.body;
    const inviter = req.user;

    if (!inviter || inviter.role !== 'Landlord') {
        return res.status(403).json({ success: false, message: 'Only Landlords can invite agents.' });
    }
    if (!recipientEmail) {
        return res.status(400).json({ success: false, message: 'Recipient email is required.' });
    }

    try {
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
            'agentInvitation', // We will create this template next
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


// @desc    Get invitation details from a token
// @route   GET /api/invitations/accept/:token
export const getInvitationDetails = async (req: Request, res: Response) => {
    try {
        const invitation = await AgentInvitation.findOne({ token: req.params.token, status: 'pending', expiresAt: { $gt: new Date() } })
            .populate('inviterId', 'name');

        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invitation not found, is invalid, or has expired.' });
        }

        const existingUser = await User.findOne({ email: invitation.recipientEmail });

        res.status(200).json({
            success: true,
            data: {
                recipientEmail: invitation.recipientEmail,
                inviterName: (invitation.inviterId as any).name,
                isExistingUser: !!existingUser,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// @desc    Accept an invitation and link accounts
// @route   POST /api/invitations/accept/:token
export const acceptAgentInvitation = async (req: Request, res: Response) => {
    const { password } = req.body; // User provides password if they are new

    try {
        const invitation = await AgentInvitation.findOne({ token: req.params.token, status: 'pending', expiresAt: { $gt: new Date() } });
        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invitation not found, is invalid, or has expired.' });
        }

        let agentUser = await User.findOne({ email: invitation.recipientEmail });
        
        // If user doesn't exist, create a new Agent account
        if (!agentUser) {
            if (!password) {
                return res.status(400).json({ success: false, message: 'Password is required for new users.' });
            }
            agentUser = await User.create({
                email: invitation.recipientEmail,
                name: invitation.recipientEmail.split('@')[0], // a default name
                password,
                role: 'Agent',
                organizationId: invitation.organizationId,
            });
        }

        // Link the Landlord and Agent
        await User.findByIdAndUpdate(invitation.inviterId, { $addToSet: { managedAgentIds: agentUser._id } });
        await User.findByIdAndUpdate(agentUser._id, { $addToSet: { associatedLandlordIds: invitation.inviterId } });
        
        // Mark invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();
        
        // Return a JWT for the new/existing agent to log them in
        const token = agentUser.getSignedJwtToken();
        res.status(200).json({ success: true, token });

    } catch (error) {
        console.error("Error accepting invitation:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
