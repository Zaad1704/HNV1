import mongoose, { Schema, Document, model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

// The IUser interface now includes all the necessary fields and method signatures.
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId: mongoose.Types.ObjectId;
  isIndependentAgent?: boolean;
  createdAt: Date;
  googleId?: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  permissions: string[];
  managedAgentIds?: mongoose.Types.ObjectId[];
  
  // --- Fields to fix the build error ---
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  phone?: string;
  profilePicture?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorToken?: string;
  twoFactorExpires?: Date;
  
  // --- Method signatures ---
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getEmailVerificationToken(): string; // Added method
  getPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function(this: IUser): boolean {
      return !this.googleId;
    },
    select: false
  },
  role: { type: String, enum: ['Super Admin', 'Super Moderator', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  isIndependentAgent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  googleId: String,
  status: { type: String, enum: ['active', 'suspended', 'pending', 'inactive'], default: 'active' },
  permissions: { type: [String], default: [] },
  managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],

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
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Instance Methods ---

UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  if (!this.password || !enteredPassword) {
    console.log('Password matching failed: missing password or entered password');
    return false;
  }
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', result);
    return result;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

UserSchema.methods.getSignedJwtToken = function(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT Secret is not defined in environment variables.');
  }
  const payload = { id: (this._id as Types.ObjectId).toString(), role: this.role, name: this.name };
  const secret: Secret = process.env.JWT_SECRET;
  const options: SignOptions = {
    // @ts-ignore
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  };
  return jwt.sign(payload, secret, options);
};

// Implementation for the email verification token method
UserSchema.methods.getEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
  return verificationToken;
};

// Implementation for the password reset token method
UserSchema.methods.getPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

export default model<IUser>('User', UserSchema);
