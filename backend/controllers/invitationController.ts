import { Request, Response } from 'express';
import User from '../models/User';
import AgentInvitation from '../models/AgentInvitation';
import Subscription from '../models/Subscription';
// Import both the model and the IPlan interface from the Plan model file
import Plan, { IPlan } from '../models/Plan';
import emailService from '../services/emailService';

export const inviteAgent = async (req: Request, res: Response) => {
  const { recipientEmail } = req.body;
  // The '!' asserts that req.user is not null, which is safe inside a protected route.
  const inviter = req.user!;

  if (inviter.role !== 'Landlord') {
    return res.status(403).json({
      success: false,
      message: 'Only Landlords can invite agents',
    });
  }

  if (!recipientEmail) {
    return res.status(400).json({
      success: false,
      message: 'Recipient email is required',
    });
  }

  try {
    // Check subscription limits
    const subscription = await Subscription.findOne({
      organizationId: inviter.organizationId,
    }).populate<{ planId: IPlan }>('planId');

    if (!subscription?.planId) {
      return res.status(403).json({
        success: false,
        message: 'No valid subscription found',
      });
    }

    // Null check for managedAgentIds with default empty array
    const currentAgentCount = inviter.managedAgentIds?.length || 0;
    if (currentAgentCount >= (subscription.planId.limits?.maxAgents || 0)) {
      return res.status(403).json({
        success: false,
        message: `You have reached the maximum number of agents for your plan`,
      });
    }

    // Check if user already exists in organization
    const existingUser = await User.findOne({
      email: recipientEmail,
      organizationId: inviter.organizationId,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This user is already part of your organization',
      });
    }

    // Check for pending invites
    const pendingInvite = await AgentInvitation.findOne({
      recipientEmail,
      organizationId: inviter.organizationId,
      status: 'pending',
    });

    if (pendingInvite) {
      return res.status(400).json({
        success: false,
        message: 'This user already has a pending invitation',
      });
    }

    // Create invitation
    const invitation = await AgentInvitation.create({
      organizationId: inviter.organizationId,
      inviterId: inviter._id,
      recipientEmail,
      role: 'Agent', // Explicitly set the role for this invitation type
      status: 'pending',
    });

    // Send invitation email
    const acceptURL = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/accept-agent-invite/${invitation.token}`;

    // Corrected: Provide fallback for optional inviter.name
    const inviterName = inviter.name || 'Your Landlord';

    await emailService.sendEmail(
      recipientEmail,
      `Invitation to join ${inviterName}'s Team`,
      'agentInvitation',
      {
        inviterName: inviterName,
        acceptURL,
      }
    );

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${recipientEmail}`,
    });
  } catch (error) {
    console.error('Error inviting agent:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const invitation = await AgentInvitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation token.',
      });
    }

    // Check if a user with this email already exists
    let user = await User.findOne({ email: invitation.recipientEmail });
    
    // If user does not exist, create a new one
    if (!user) {
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required for new users.'});
        }
        user = new User({
            email: invitation.recipientEmail,
            password: password, // The password will be hashed by the pre-save hook in the User model
            role: invitation.role,
            status: 'active',
            organizationId: invitation.organizationId,
        });
    } else {
        // If user exists but is not in an org, assign them to this one
        if (!user.organizationId) {
            user.organizationId = invitation.organizationId;
        } else if (user.organizationId.toString() !== invitation.organizationId.toString()) {
            // This is an edge case: the user exists but is already in another organization.
            // You might want to prevent this or handle it differently based on your business logic.
            return res.status(400).json({ success: false, message: 'User is already a member of another organization.'});
        }
    }

    // Add agent to the inviter's list of managed agents
    await User.findByIdAndUpdate(invitation.inviterId, {
      $addToSet: { managedAgentIds: user._id },
    });

    // Link agent to the landlord
    user.associatedLandlordIds = user.associatedLandlordIds || [];
    user.associatedLandlordIds.push(invitation.inviterId);

    await user.save();

    // Update invitation status to 'accepted'
    invitation.status = 'accepted';
    await invitation.save();

    // Log the new user in by returning a JWT token
    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully!',
      token: jwtToken
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
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
        message: 'Invitation not found or invalid.',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been accepted or has expired.',
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This invitation has expired.',
      });
    }

    // Check if a user account already exists for this email
    const existingUser = await User.findOne({ email: invitation.recipientEmail });

    res.status(200).json({
      success: true,
      data: {
        inviterName: (invitation.inviterId as any)?.name || 'An HNV User',
        organizationName: (invitation.organizationId as any)?.name,
        recipientEmail: invitation.recipientEmail,
        isExistingUser: !!existingUser // Send a flag to the frontend
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
