"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.googleAuthCallback = exports.verifyEmail = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const crypto_1 = __importDefault(require("crypto"));
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
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, password, and role'
        });
    }
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            if (!userExists.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered but not verified. Please check your inbox.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'User with that email already exists'
            });
        }
        const trialPlan = await Plan_1.default.findOne({ name: 'Free Trial' });
        if (!trialPlan) {
            return res.status(500).json({
                success: false,
                message: 'Trial plan not configured. Please run setup.'
            });
        }
        const organization = new Organization_1.default({
            name: `${name}'s Organization`,
            status: 'active'
        });
        await organization.save();
        const user = new User_1.default({
            name,
            email,
            password,
            role,
            organizationId: organization._id,
            status: 'pending'
        });
        organization.owner = user._id;
        organization.members = [user._id];
        await organization.save();
        const verificationToken = user.getEmailVerificationToken();
        await user.save();
        const subscription = new Subscription_1.default({
            organizationId: organization._id,
            planId: trialPlan._id,
            status: 'trialing',
            trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        });
        await subscription.save();
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }
    try {
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
        }
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is suspended. Please contact support.'
            });
        }
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};
exports.loginUser = loginUser;
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                status: user.status
            }
        });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getMe = getMe;
const verifyEmail = async (req, res, next) => {
    const { token } = req.params;
    try {
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.default.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }
        user.isEmailVerified = true;
        user.status = 'active';
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};
exports.verifyEmail = verifyEmail;
const googleAuthCallback = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
        }
        const token = req.user.getSignedJwtToken();
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
    }
    catch (error) {
        console.error('Google auth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed`);
    }
};
exports.googleAuthCallback = googleAuthCallback;
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, profilePicture } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (profilePicture)
            user.profilePicture = profilePicture;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};
exports.updateProfile = updateProfile;
