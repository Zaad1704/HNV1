"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTwoFactor = exports.enableTwoFactor = exports.generateTwoFactorSecret = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const User_1 = __importDefault(require("../models/User"));
const generateTwoFactorSecret = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    const secret = speakeasy_1.default.generateSecret({
        name: `HNV Property (${req.user.email})`,
        issuer: 'HNV Property Management'
    });
    await User_1.default.findByIdAndUpdate(req.user._id, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false
    });
    const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
    res.json({
        success: true,
        data: {
            secret: secret.base32,
            qrCode: qrCodeUrl
        }
    });
};
exports.generateTwoFactorSecret = generateTwoFactorSecret;
const enableTwoFactor = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    const { token } = req.body;
    const user = await User_1.default.findById(req.user._id);
    if (!user?.twoFactorSecret) {
        res.status(400).json({ success: false, message: 'Two-factor not set up' });
        return;
    }
    const verified = speakeasy_1.default.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
    });
    if (!verified) {
        res.status(400).json({ success: false, message: 'Invalid token' });
        return;
    }
    await User_1.default.findByIdAndUpdate(req.user._id, { twoFactorEnabled: true });
    res.json({ success: true, message: 'Two-factor authentication enabled' });
};
exports.enableTwoFactor = enableTwoFactor;
const verifyTwoFactor = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    const user = await User_1.default.findById(req.user._id);
    if (!user?.twoFactorEnabled) {
        return next();
    }
    const { twoFactorToken } = req.body;
    if (!twoFactorToken) {
        res.status(400).json({ success: false, message: 'Two-factor token required' });
        return;
    }
    const verified = speakeasy_1.default.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
    });
    if (!verified) {
        res.status(400).json({ success: false, message: 'Invalid two-factor token' });
        return;
    }
    next();
};
exports.verifyTwoFactor = verifyTwoFactor;
