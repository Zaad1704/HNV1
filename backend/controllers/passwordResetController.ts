// backend/controllers/passwordResetController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import crypto from 'crypto';
import emailService from '../services/emailService'; // Assuming you have an email service

// ADDED THIS FUNCTION
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Still send a success-like message to prevent user enumeration
      return res.status(200).json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' });
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await emailService.sendEmail(
          user.email,
          'Password Reset Request',
          'passwordReset', // Assumes a template named passwordReset.html
          { userName: user.name || 'User', resetUrl }
      );
      res.status(200).json({ success: true, message: 'Email sent.' });
    } catch (err) {
      console.error(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while resetting password.' });
  }
};
