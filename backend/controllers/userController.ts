import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; 
import { Types } from 'mongoose'; 

// @desc    Get all users (Super Admin only)
const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID (Super Admin only)
const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user (Super Admin only)
const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user (Super Admin only)
const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users within the same organization
const getOrgUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const users = await User.find({ organizationId: req.user.organizationId });
    res.status(200).json({ success: true, data: users });
});

// @desc    Get agents managed by the current Landlord
const getManagedAgents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user || req.user.role !== 'Landlord') {
        res.status(403);
        throw new Error('User is not a Landlord');
    }
    // `req.user.managedAgentIds` is now correctly typed from IUser interface
    const agents = await User.find({ '_id': { $in: req.user.managedAgentIds || [] } }); 
    res.status(200).json({ success: true, data: agents });
});

// @desc    Update user password
const updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated');
    }
    
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();
    
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
        token: token
    });
});

/**
 * @desc    Allows an authenticated user to request deletion of their account and organization.
 * @route   POST /api/users/request-deletion
 * @access  Private
 */
const requestAccountDeletion = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('Not authorized or not part of an organization');
    }

    const organization = await Organization.findById(req.user.organizationId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }

    if (organization.allowSelfDeletion === false) {
        res.status(403);
        throw new Error('Self-service account deletion has been disabled by the platform administrator. Please contact support.');
    }

    organization.status = 'pending_deletion';
    if (!organization.dataManagement) {
        organization.dataManagement = {};
    }
    organization.dataManagement.accountDeletionRequestedAt = new Date();
    
    await organization.save();

    res.status(200).json({ success: true, message: 'Account deletion request received. Your account will be permanently deleted after the grace period.' });
});


export { 
    getUsers, 
    getUser, 
    updateUser, 
    deleteUser, 
    getOrgUsers, 
    getManagedAgents,
    updatePassword,
    requestAccountDeletion
};
