// backend/controllers/invitationController.ts

import { Request, Response } from 'express';
import AgentInvitation from '../models/AgentInvitation';
import User from '../models/User';
import Property from '../models/Property';
import emailService from '../services/emailService';

export const inviteUser = async (req: Request, res: Response) => {
    const { recipientEmail, role, propertyId } = req.body;
    const inviter = req.user!;

    if (!inviter.organizationId) {
        return res.status(401).json({ success: false, message: 'User not part of an organization.'});
    }

    if (!recipientEmail || !role || !propertyId) {
        return res.status(400).json({ success: false, message: 'Recipient email, role, and property are required.' });
    }
    
    try {
        const property = await Property.findById(propertyId);
        if (!property || !property.organizationId.equals(inviter.organizationId)) {
            return res.status(404).json({ success: false, message: 'Property not found in your organization.' });
        }
        
        const invitation = await AgentInvitation.create({
            organizationId: inviter.organizationId,
            inviterId: inviter._id,
            recipientEmail,
            role,
            propertyId,
            status: 'pending',
        });
        const acceptURL = `${process.env.FRONTEND_URL}/accept-agent-invite/${invitation.token}`;
        await emailService.sendEmail(recipientEmail, `Invitation to join ${inviter.name}'s Team`, 'agentInvitation', { inviterName: inviter.name || 'Your Colleague', acceptURL });
        res.status(201).json({ success: true, message: `Invitation sent to ${recipientEmail}` });
    } catch(err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getInvitationDetails = async (req: Request, res: Response) => {
    try {
        const invitation = await AgentInvitation.findOne({ token: req.params.token }).populate('inviterId', 'name');
        if (!invitation || invitation.status !== 'pending' || new Date() > invitation.expiresAt) {
            return res.status(404).json({ success: false, message: 'Invitation not found or has expired.' });
        }
        const existingUser = await User.findOne({ email: invitation.recipientEmail });
        res.status(200).json({
            success: true,
            data: {
                inviterName: (invitation.inviterId as any)?.name,
                recipientEmail: invitation.recipientEmail,
                isExistingUser: !!existingUser
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const acceptInvitation = async (req: Request, res: Response) => {
     try {
        const invitation = await AgentInvitation.findOne({ token: req.params.token, status: 'pending', expiresAt: { $gt: new Date() } });
        if (!invitation) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }
        
        const user = new User({ email: invitation.recipientEmail, password: req.body.password, role: invitation.role, organizationId: invitation.organizationId, status: 'active' });
        await user.save();
        invitation.status = 'accepted';
        await invitation.save();
        const jwtToken = user.getSignedJwtToken();
        res.status(200).json({ success: true, token: jwtToken });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
