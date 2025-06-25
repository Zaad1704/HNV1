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
  // FIX: New fields for email verification
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
  getEmailVerificationToken(): string; // FIX: New method signature
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  // FIX: Schema definition for new fields
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
  // ... (no changes to this method)
};

UserSchema.methods.getPasswordResetToken = function(): string {
  // ... (no changes to this method)
};

// FIX: New method to generate email verification token
UserSchema.methods.getEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  // Set expiry to 1 hour from now
  this.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000); 
  
  return verificationToken;
};


export default model<IUser>('User', UserSchema);
