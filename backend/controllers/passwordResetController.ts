import { Request, Response } from 'express';
import User from '../models/User';
import crypto from 'crypto';

export const resetPassword = async (req: Request, res: Response) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined; // Instead of delete
    user.passwordResetExpires = undefined; // Instead of delete
    await user.save();

    // Optionally: send a password change confirmation email

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
};
