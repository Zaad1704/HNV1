"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.resendVerification = exports.googleAuthCallback = exports.getMe = exports.verifyEmail = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const emailService_1 = __importDefault(require("../services/emailService"));
const auditService_1 = __importDefault(require("../services/auditService"));
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
        return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            if (!userExists.isEmailVerified) {
                return res.status(400).json({ success: false, message: 'This email is already registered but not verified. Please check your inbox.' });
            }
            return res.status(400).json({ success: false, message: 'User with that email already exists' });
        }
        const trialPlan = await Plan_1.default.findOne({ name: 'Free Trial' });
        if (!trialPlan) {
            return res.status(500).json({ success: false, message: 'Trial plan not configured. Please run setup.' });
        }
        const organization = new Organization_1.default({ name: `${name}'s Organization`, members: [] });
        const user = new User_1.default({
            name,
            email,
            password,
            role,
            organizationId: organization._id,
            isEmailVerified: false
        });
        const verificationToken = user.getEmailVerificationToken();
        organization.owner = user._id;
        organization.members.push(user._id);
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        const subscription = new Subscription_1.default({
            organizationId: organization._id,
            planId: trialPlan._id,
            status: 'trialing',
            trialExpiresAt: trialEndDate,
        });
        organization.subscription = subscription._id;
        await organization.save();
        await subscription.save();
        await user.save({ validateBeforeSave: false });
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
            await emailService_1.default.sendEmail(user.email, 'Verify Your Email Address', 'emailVerification', { userName: user.name, verificationUrl });
            try {
                await emailService_1.default.sendEmail(user.email, 'Welcome to HNV Property Management!', 'welcome', {
                    name: user.name,
                    dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
                });
            }
            catch (welcomeError) {
                console.error('Welcome email failed:', welcomeError);
            }
            res.status(201).json({
                success: true,
                message: 'Registration successful! Please check your email to verify your account.'
            });
        }
        catch (emailError) {
            console.error('Email sending failed:', emailError);
            res.status(201).json({
                success: true,
                message: 'Registration successful! Email verification temporarily unavailable - you can log in directly.'
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
                code: 'MISSING_CREDENTIALS'
            });
        }
        console.log('Login attempt for email:', email);
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }
        console.log('User found:', { id: user._id, email: user.email, hasPassword: !!user.password });
        const isMatch = await user.matchPassword(password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }
        if (user.status === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.',
                code: 'ACCOUNT_SUSPENDED'
            });
        }
        if (!user.isEmailVerified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
                code: 'EMAIL_NOT_VERIFIED'
            });
        }
        try {
            auditService_1.default.recordAction(user._id, user.organizationId, 'USER_LOGIN', { loginTime: new Date(), userAgent: req.get('User-Agent') });
        }
        catch (auditError) {
            console.warn('Audit logging failed:', auditError);
        }
        await sendTokenResponse(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login. Please try again.',
            code: 'SERVER_ERROR'
        });
    }
};
exports.loginUser = loginUser;
const verifyEmail = async (req, res) => {
    const { token } = req.params;
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(token)
        .digest('hex');
    const user = await User_1.default.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });
    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification token. Please try registering again.' });
    }
    user.isEmailVerified = true;
    user.status = 'active';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
};
exports.verifyEmail = verifyEmail;
const getMe = async (req, res) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = await User_1.default.findById(req.user._id).populate({
        path: 'organizationId',
        select: 'name status subscription branding',
        populate: {
            path: 'subscription',
            model: 'Subscription',
            select: 'planId status trialExpiresAt currentPeriodEndsAt',
            populate: {
                path: 'planId',
                model: 'Plan',
                select: 'name price duration features limits'
            }
        }
    });
    res.status(200).json({ success: true, data: user });
};
exports.getMe = getMe;
const googleAuthCallback = (req, res) => {
    if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google-auth-failed`);
    }
    const token = req.user.getSignedJwtToken();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/google/callback?token=${token}`);
};
exports.googleAuthCallback = googleAuthCallback;
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }
        const verificationToken = user.getEmailVerificationToken();
        await user.save({ validateBeforeSave: false });
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
        await emailService_1.default.sendEmail(user.email, 'Verify Your Email Address', 'emailVerification', {
            userName: user.name,
            verificationUrl: verificationUrl
        });
        res.json({ success: true, message: 'Verification email sent' });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, message: 'Failed to resend verification email' });
    }
};
exports.resendVerification = resendVerification;
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, profilePicture } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (phone)
            user.phone = phone;
        if (profilePicture)
            user.profilePicture = profilePicture;
        await user.save();
        auditService_1.default.recordAction(user._id, user.organizationId, 'PROFILE_UPDATE', { updatedFields: Object.keys(req.body) });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};
exports.updateProfile = updateProfile;
