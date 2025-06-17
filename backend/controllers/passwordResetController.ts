import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import emailService from '../services/emailService';

// @desc    Handle "Forgot Password" request
// @route   POST /api/password-reset/forgot
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            // We don't want to reveal if a user exists or not for security reasons.
            // Send a success response regardless.
            return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        }

        // Get the unhashed reset token
        const resetToken = user.getPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        
        // A developer should create a 'passwordReset.html' template
        await emailService.sendEmail(
            user.email,
            'Your Password Reset Link',
            'passwordReset',
            {
                userName: user.name,
                resetUrl: resetUrl
            }
        );

        res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });

    } catch (error) {
        console.error(error);
        // Clear token fields on error
        const user = await User.findOne({ email });
        if(user) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ success: false, message: 'Server error while sending reset email.' });
    }
};

// @desc    Handle the actual password reset
// @route   PUT /api/password-reset/:resetToken
export const resetPassword = async (req: Request, res: Response) => {
    // Get hashed token from the URL
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
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // A developer might want to send a password change confirmation email here.

        res.status(200).json({ success: true, message: 'Password reset successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error while resetting password.' });
    }
};
