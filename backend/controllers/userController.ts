import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// This helper function would ideally be in a shared utility file
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

/**
 * @desc    Get user profile for the currently logged-in user
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    // The user object is attached to the request by the 'protect' middleware.
    // We assume the middleware has already fetched the user.
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: req.user });
};

/**
 * @desc    Update user details (e.g., name) for the currently logged-in user
 * @route   PUT /api/users/updatedetails
 * @access  Private
 */
export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id, 
      { name }, 
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update password for the currently logged-in user
 * @route   PUT /api/users/updatepassword
 * @access  Private
 */
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    // We must fetch the user with the password field included to compare it
    const user = await User.findById(req.user!.id).select('+password');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the provided current password matches the one in the database
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    // Set the new password. The pre-save hook in the model will hash it.
    user.password = newPassword;
    await user.save();

    // It's good practice to send a new token after a password change.
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
