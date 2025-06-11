import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// This helper function can be shared or defined where needed.
// It creates a JWT and sends it in the response.
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

/**
 * @desc    Get profile for the currently logged-in user
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    // The 'protect' middleware already fetches the user and attaches it to the request.
    // We just need to send it back.
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

    // Find the user by the ID from the token and update their name
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

    // Use the method defined in the User model to check the password
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
