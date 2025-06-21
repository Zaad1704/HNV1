import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

// @desc    Get all users (Super Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get user by ID (Super Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user (Super Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req: Request, res: Response) => {
    // Implementation for updating a user
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
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// --- FIX: START OF ADDED FUNCTIONS ---

// @desc    Get all users within the same organization
// @route   GET /api/users/organization
// @access  Private (Landlord, Agent)
const getOrgUsers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const users = await User.find({ organizationId: req.user.organizationId });
    res.status(200).json({ success: true, data: users });
});

// @desc    Get agents managed by the current Landlord
// @route   GET /api/users/my-agents
// @access  Private (Landlord)
const getManagedAgents = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'Landlord') {
        res.status(403);
        throw new Error('User is not a Landlord');
    }
    
    // Find users whose _id is in the current user's managedAgentIds array
    const agents = await User.find({ '_id': { $in: req.user.managedAgentIds } });
    res.status(200).json({ success: true, data: agents });
});

// --- FIX: END OF ADDED FUNCTIONS ---


// FIX: Corrected the export statement to include the new functions
export { 
    getUsers, 
    getUser, 
    updateUser, 
    deleteUser, 
    getOrgUsers, 
    getManagedAgents 
};
