import { Request, Response } from 'express';
import AgentInvitation from '../models/AgentInvitation';
import User from '../models/User';
import Property from '../models/Property';
import emailService from '../services/emailService';
import { addDays } from 'date-fns';

// inviteUser, getInvitationDetails, acceptInvitation functions remain the same...
export const inviteUser = async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }

    const { email: recipientEmail, role } = req.body;
    const inviter = req.user;

    if (!recipientEmail || !role) {
        return res.status(400).json({ success: false, message: 'Recipient email and role are required.' });
    }
    if (role !== 'Agent') {
        return res.status(400).json({ success: false, message: 'Only "Agent" role can be invited this way.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: recipientEmail });
        if (existingUser && existingUser.organizationId?.toString() === inviter.organizationId.toString()) {
            return res.status(400).json({ success: false, message: 'User with this email is already a member of your organization.' });
        }

        // Check if a pending invitation already exists for this email and organization
        const existingInvitation = await AgentInvitation.findOne({
            recipientEmail,
            organizationId: inviter.organizationId,
            status: 'pending'
        });

        if (existingInvitation) {
            return res.status(400).json({ success: false, message: 'An invitation has already been sent to this email for your organization.' });
        }

        const newInvitation = await AgentInvitation.create({
            organizationId: inviter.organizationId,
            inviterId: inviter._id,
            recipientEmail,
            role: role,
            status: 'pending',
            // token and expiresAt are generated in pre-save hook
        });

        // Send invitation email
        const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${newInvitation.token}`;
        await emailService.sendEmail(
            newInvitation.recipientEmail, 
            `Invitation to join ${inviter.name}'s Team on HNV`, 
            'agentInvitation', // Use an email template
            { inviterName: inviter.name, acceptURL } // Data for the template
        );

        res.status(200).json({ success: true, message: 'Invitation sent successfully.', data: newInvitation });

    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getInvitationDetails = async (req: Request, res: Response) => { 
    const { token } = req.params;
    try {
        const invitation = await AgentInvitation.findOne({ token });

        if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
        }

        const existingUser = await User.findOne({ email: invitation.recipientEmail });

        res.status(200).json({ 
            success: true, 
            data: { 
                email: invitation.recipientEmail, 
                isExistingUser: !!existingUser,
                inviterName: (await User.findById(invitation.inviterId))?.name || 'Your Landlord'
            } 
        });
    } catch (error) {
        console.error('Error fetching invitation details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const acceptInvitation = async (req: Request, res: Response) => { 
    const { token } = req.params;
    const { password } = req.body; // Password is only needed for new users
    
    try {
        const invitation = await AgentInvitation.findOne({ token });

        if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
        }

        let user = await User.findOne({ email: invitation.recipientEmail });

        if (user) {
            // Existing user accepting invitation
            if (user.organizationId && user.organizationId.toString() !== invitation.organizationId.toString()) {
                return res.status(400).json({ success: false, message: 'This email is already associated with another organization.' });
            }
            user.organizationId = invitation.organizationId;
            user.role = invitation.role;
            await user.save();
        } else {
            // New user creating account
            if (!password) {
                return res.status(400).json({ success: false, message: 'Password is required to create a new account.' });
            }
            user = await User.create({
                name: invitation.recipientEmail.split('@')[0], // Default name from email
                email: invitation.recipientEmail,
                password,
                role: invitation.role,
                organizationId: invitation.organizationId,
            });
        }

        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).json({ success: true, message: 'Invitation accepted. Account created/updated.', token: user.getSignedJwtToken() });

    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


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
