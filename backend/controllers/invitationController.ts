// backend/controllers/invitationController.ts
import { Request, Response } from 'express';
import AgentInvitation from '../models/AgentInvitation';
import User from '../models/User';
import Property from '../models/Property'; // Import Property model
import emailService from '../services/emailService';

export const inviteUser = async (req: Request, res: Response) => {
    const { recipientEmail, role, propertyId } = req.body;
    const inviter = req.user!;

    if (!recipientEmail || !role || !propertyId) {
        return res.status(400).json({ success: false, message: 'Recipient email, role, and property are required.' });
    }

    // Business Logic:
    // - Agents can only invite Landlords.
    // - Landlords can only invite Agents.
    if ((inviter.role === 'Agent' && role !== 'Landlord') || (inviter.role === 'Landlord' && role !== 'Agent')) {
        return res.status(403).json({ success: false, message: `A ${inviter.role} cannot invite a ${role}.`});
    }

    try {
        const property = await Property.findById(propertyId);
        if (!property || !property.organizationId.equals(inviter.organizationId)) {
            return res.status(404).json({ success: false, message: 'Property not found in your organization.' });
        }

        const existingUser = await User.findOne({ email: recipientEmail });
        if (existingUser && existingUser.organizationId) {
             return res.status(400).json({ success: false, message: 'User already belongs to an organization.' });
        }

        const pendingInvite = await AgentInvitation.findOne({ recipientEmail, organizationId: inviter.organizationId, status: 'pending' });
        if (pendingInvite) {
            return res.status(400).json({ success: false, message: 'This user already has a pending invitation.' });
        }

        const invitation = await AgentInvitation.create({
            organizationId: inviter.organizationId,
            inviterId: inviter._id,
            recipientEmail,
            role, // 'Agent' or 'Landlord'
            propertyId, // Associate property with invite
            status: 'pending',
        });

        const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${invitation.token}`;
        const inviterName = inviter.name || 'Your Colleague';

        await emailService.sendEmail(
          recipientEmail,
          `Invitation to join ${inviterName}'s Team on HNV`,
          'agentInvitation', // Can be a generic template
          { inviterName, acceptURL }
        );

        res.status(201).json({ success: true, message: `Invitation sent to ${recipientEmail}` });

    } catch (error) {
        console.error('Error in inviteUser:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ... other invitation functions like getInvitationDetails and acceptInvitation would also need updates to handle this logic ...
