import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId?: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  createdAt: Date;
  googleId?: string;
  status: 'active' | 'suspended' | 'pending';
  permissions: string[];
  managedAgentIds: mongoose.Types.ObjectId[];
  managedProperties: mongoose.Types.ObjectId[];
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  phone?: string;
  profilePicture?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;
  twoFactorToken?: string;
  twoFactorExpires?: Date;
  passkeys: Array<{
    id: string;
    publicKey: string;
    counter: number;
    deviceName: string;
    createdAt: Date;
  }>;
  language?: string;
  autoDetectLanguage?: boolean;
  passkeyChallenge?: string;
  passkeyChallengeExpires?: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getEmailVerificationToken(): string;
  getPasswordResetToken(): string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    select: false
  },
  role: { type: String, enum: ['Super Admin', 'Super Moderator', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  createdAt: { type: Date, default: Date.now },
  googleId: String,
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  permissions: { type: [String], default: [] },
  managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  managedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  phone: { type: String },
  profilePicture: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  twoFactorTempSecret: { type: String, select: false },
  twoFactorToken: { type: String, select: false },
  twoFactorExpires: { type: Date, select: false },
  passkeys: [{
    id: { type: String, required: true },
    publicKey: { type: String, required: true },
    counter: { type: Number, default: 0 },
    deviceName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  language: { type: String, default: 'en' },
  autoDetectLanguage: { type: Boolean, default: true },
  passkeyChallenge: { type: String, select: false },
  passkeyChallengeExpires: { type: Date, select: false }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function() {
  const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  const payload = { 
    id: this._id.toString(), 
    role: this.role, 
    name: this.name,
    organizationId: this.organizationId?.toString()
  };
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  } as jwt.SignOptions;
  return jwt.sign(payload, secret, options);
};

UserSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return verificationToken;
};

UserSchema.methods.getPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

export default mongoose.model<IUser>('User', UserSchema);