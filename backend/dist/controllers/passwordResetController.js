"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = void 0;
const User_1 = __importDefault(require("../models/User"));
const forgotPassword = async (req, res) => {
    try { }
    finally {
    }
    const { email } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(200).json({ success: true, message: 'If a user with that email exists, a reset link has been sent.' });
        return;
        const resetToken = user.getPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    }
};
exports.forgotPassword = forgotPassword;
