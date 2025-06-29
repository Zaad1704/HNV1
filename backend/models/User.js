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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    // --- Schema definitions for the new fields ---
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
// --- Lifecycle Hooks (pre-save for password hashing) ---
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
// --- Instance Methods ---
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password)
        return false;
    return await bcrypt.compare(enteredPassword, this.password);
};
UserSchema.methods.getSignedJwtToken = function () {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT Secret is not defined in environment variables.');
    }
    const payload = { id: this._id.toString(), role: this.role, name: this.name };
    const secret = process.env.JWT_SECRET;
    const options = {
        // @ts-ignore
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
// Implementation for the email verification token method
UserSchema.methods.getEmailVerificationToken = function () {
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    return verificationToken;
};
// Implementation for the password reset token method
UserSchema.methods.getPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(20).toString('hex');
    this.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};
exports.default = (0, mongoose_1.model)('User', UserSchema);
//# sourceMappingURL=User.js.map