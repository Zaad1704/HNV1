import mongoose, { Schema, Document, model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  googleId?: string;
  status: 'active' | 'suspended' | 'pending';
  permissions: string[];
  managedAgentIds?: mongoose.Types.ObjectId[];
  
  // FIX: All fields are correctly defined in the interface
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
  getEmailVerificationToken(): string;
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
  role: { type: String, enum: ['Super Admin', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  googleId: String,
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  permissions: { type: [String], default: [] },
  managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  
  // FIX: All fields are correctly defined in the schema
  passwordResetToken: String,
  passwordResetExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
});

UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
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

// FIX: Ensured this method always returns a string as per the interface
UserSchema.methods.getPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// FIX: Ensured this method always returns a string as per the interface
UserSchema.methods.getEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); 
  return verificationToken;
};

export default model<IUser>('User', UserSchema);
