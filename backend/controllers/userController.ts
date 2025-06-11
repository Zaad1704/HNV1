import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user!.id, { name }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    // Re-issue a token
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });
  } catch (error) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
