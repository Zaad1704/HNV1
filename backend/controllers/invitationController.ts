import { Request, Response } from 'express';
import User from '../models/User';
import AgentInvitation from '../models/AgentInvitation';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import emailService from '../services/emailService';
import mongoose from 'mongoose';

export const inviteAgent = async (req: Request, res: Response) => {
  const { recipientEmail } = req.body;
  const inviter = req.user;

  if (!inviter || inviter.role !== 'Landlord') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only Landlords can invite agents' 
    });
  }

  if (!recipientEmail) {
    return res.status(400).json({ 
      success: false, 
      message: 'Recipient email is required' 
    });
  }

  try {
    // Check subscription limits
    const subscription = await Subscription.findOne({ 
      organizationId: inviter.organizationId 
    }).populate<{ planId: Plan }>('planId');

    if (!subscription?.planId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No valid subscription found' 
      });
    }

    // Null check for managedAgentIds with default empty array
    const currentAgentCount = inviter.managedAgentIds?.length || 0;
    if (currentAgentCount >= (subscription.planId.limits?.maxAgents || 0)) {
      return res.status(403).json({ 
        success: false, 
        message: `You have reached the maximum number of agents for your plan` 
      });
    }

    // Check if user already exists in organization
    const existingUser = await User.findOne({ 
      email: recipientEmail,
      organizationId: inviter.organizationId
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'This user is already part of your organization' 
      });
    }

    // Check for pending invites
    const pendingInvite = await AgentInvitation.findOne({ 
      recipientEmail,
      organizationId: inviter.organizationId,
      status: 'pending'
    });

    if (pendingInvite) {
      return res.status(400).json({ 
        success: false, 
        message: 'This user already has a pending invitation' 
      });
    }

    // Create invitation
    const invitation = await AgentInvitation.create({
      organizationId: inviter.organizationId,
      inviterId: inviter._id,
      recipientEmail,
      status: 'pending'
    });

    // Send invitation email
    const acceptURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation/${invitation.token}`;
    
    await emailService.sendEmail(
      recipientEmail,
      `Invitation to join ${inviter.name}'s Team`,
      'agentInvitation',
      {
        inviterName: inviter.name,
        acceptURL
      }
    );

    res.status(201).json({ 
      success: true, 
      message: `Invitation sent to ${recipientEmail}` 
    });
  } catch (error) {
    console.error('Error inviting agent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { name, password } = req.body;

  try {
    const invitation = await AgentInvitation.findOne({ 
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid or expired invitation' 
      });
    }

    // Create new agent user
    const agent = await User.create({
      name,
      email: invitation.recipientEmail,
      password,
      role: 'Agent',
      organizationId: invitation.organizationId,
      status: 'active'
    });

    // Add agent to landlord's managed agents
    await User.findByIdAndUpdate(invitation.inviterId, {
      $addToSet: { managedAgentIds: agent._id }
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({ 
      success: true, 
      message: 'Invitation accepted successfully' 
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

export const getInvitationDetails = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const invitation = await AgentInvitation.findOne({ token })
      .populate('inviterId', 'name email')
      .populate('organizationId', 'name');

    if (!invitation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invitation not found' 
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invitation has already been processed' 
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invitation has expired' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        inviterName: (invitation.inviterId as any)?.name,
        inviterEmail: (invitation.inviterId as any)?.email,
        organizationName: (invitation.organizationId as any)?.name,
        recipientEmail: invitation.recipientEmail
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};
