"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorAuth = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = __importDefault(require("../services/emailService"));
class TwoFactorAuth {
    static generateToken() {
        return crypto_1.default.randomInt(100000, 999999).toString();

    static generateSecret() {
        return crypto_1.default.randomBytes(32).toString('hex');

    static async initiateTwoFactor(userId) {
        const token = this.generateToken();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await User_1.default.findByIdAndUpdate(userId, {
            twoFactorToken: token,
            twoFactorExpires: expiresAt
        });
        return token;

    static async sendTwoFactorCode(user) {
        const token = await this.initiateTwoFactor(user._id);
        await emailService_1.default.sendEmail(user.email, 'Two-Factor Authentication Code', 'twoFactorAuth', {
            userName: user.name,
            code: token,
            expiresIn: '10 minutes'
        });

    static async verifyTwoFactorCode(userId, code) {
        const user = await User_1.default.findById(userId);
        if (!user || !user.twoFactorToken || !user.twoFactorExpires) {
            return false;

        if (new Date() > user.twoFactorExpires) {
            // Clear expired token
            await User_1.default.findByIdAndUpdate(userId, {
                $unset: { twoFactorToken: 1, twoFactorExpires: 1 }
            });
            return false;

        if (user.twoFactorToken !== code) {
            return false;

        // Clear used token
        await User_1.default.findByIdAndUpdate(userId, {
            $unset: { twoFactorToken: 1, twoFactorExpires: 1 }
        });
        return true;

    static async enableTwoFactor(userId) {
        const secret = this.generateSecret();
        await User_1.default.findByIdAndUpdate(userId, {
            twoFactorEnabled: true,
            twoFactorSecret: secret
        });
        return secret;

    static async disableTwoFactor(userId) {
        await User_1.default.findByIdAndUpdate(userId, {
            twoFactorEnabled: false,
            $unset: {
                twoFactorSecret: 1,
                twoFactorToken: 1,
                twoFactorExpires: 1

        });


exports.TwoFactorAuth = TwoFactorAuth;
_a = TwoFactorAuth;
TwoFactorAuth.requireTwoFactor = async (req, res, next) => {
    try {
        const { twoFactorCode } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });

        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });

        // Check if user has 2FA enabled
        if (!user.twoFactorEnabled) {
            return next(); // Skip 2FA if not enabled

        if (!twoFactorCode) {
            // Send 2FA code
            await _a.sendTwoFactorCode(user);
            return res.status(200).json({
                success: true,
                message: 'Two-factor authentication code sent',
                requiresTwoFactor: true
            });

        // Verify 2FA code
        const isValid = await _a.verifyTwoFactorCode(userId, twoFactorCode);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired two-factor code'
            });

        next();

    catch (error) {
        console.error('Two-factor auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Two-factor authentication failed'
        });

};
//# sourceMappingURL=twoFactorAuth.js.map