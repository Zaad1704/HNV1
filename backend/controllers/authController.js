"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.googleAuthCallback = exports.getMe = exports.verifyEmail = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const emailService_1 = __importDefault(require("../services/emailService"));
const auditService_1 = __importDefault(require("../services/auditService"));
const crypto_1 = __importDefault(require("crypto"));
// This helper function creates and sends the JWT response
const sendTokenResponse = async (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    const subscription = await Subscription_1.default.findOne({ organizationId: user.organizationId });
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        userStatus: subscription?.status || 'inactive'
    });
};
const registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });

    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            // If user exists but is not verified, we can resend verification.
            if (!userExists.isEmailVerified) {
                // You could add logic here to resend the verification email if desired.
                return res.status(400).json({ success: false, message: 'This email is already registered but not verified. Please check your inbox.' });

            return res.status(400).json({ success: false, message: 'User with that email already exists' });

        const trialPlan = await Plan_1.default.findOne({ name: 'Free Trial' });
        if (!trialPlan) {
            return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });

        const organization = new Organization_1.default({ name: `${name}'s Organization
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed
    res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}