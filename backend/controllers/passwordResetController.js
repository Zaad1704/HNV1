"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = __importDefault(require("../services/emailService"));
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        // To prevent user enumeration, always return a success-like message.
        if (!user) {
            res.status(200).json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' });
            return;
        }
        const resetToken = user.getPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        try {
            await emailService_1.default.sendEmail(user.email, 'Password Reset Request', 'passwordReset', { userName: user.name || 'User', resetUrl });
            res.status(200).json({ success: true, message: 'Email sent.' });
        }
        catch (err) {
            console.error(err);
            // FIX: Correctly clear the token fields on the user object
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ message: 'Email could not be sent' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');
    try {
        const user = await User_1.default.findOne({
            passwordResetToken,
            passwordResetExpires: { $gt: Date.now() },
        }).select('+password');
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired token.' });
            return;
        }
        user.password = req.body.password;
        // FIX: Correctly clear the token fields on the user object
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(200).json({ success: true, message: 'Password reset successfully.' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error while resetting password.' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=passwordResetController.js.map