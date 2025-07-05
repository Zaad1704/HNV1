"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
        select: false
    },
    role: { type: String, enum: ['Super Admin', 'Super Moderator', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization' },
    createdAt: { type: Date, default: Date.now },
    googleId: String,
    status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
    permissions: { type: [String], default: [] },
    managedAgentIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    phone: { type: String },
    profilePicture: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorToken: { type: String, select: false },
    twoFactorExpires: { type: Date, select: false }
});
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password)
        return false;
    return await bcrypt.compare(enteredPassword, this.password);
};
UserSchema.methods.getSignedJwtToken = function () {
    const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
    const payload = {
        id: this._id.toString(),
        role: this.role,
        name: this.name,
        organizationId: this.organizationId?.toString()
    };
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
UserSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return verificationToken;
};
UserSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
};
exports.default = mongoose_1.default.model('User', UserSchema);
