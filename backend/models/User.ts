// models/User.ts

import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  organizationId: Types.ObjectId;
  managedAgentIds: Types.ObjectId[];
  associatedLandlordIds: Types.ObjectId[];
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['Super Admin', 'Super Moderator', 'Landlord', 'Agent', 'Tenant'],
      default: 'Tenant',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    permissions: { type: [String], default: [] },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    managedAgentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    associatedLandlordIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    googleId: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password
userSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and sign a JWT for the user
userSchema.methods.getSignedJwtToken = function (this: IUser): string {
  const jwtSecret = process.env.JWT_SECRET as string;
  if (!jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the deployment environment.');
    throw new Error('Server configuration error: JWT secret is missing.');
  }
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign({ id: this._id, role: this.role }, jwtSecret, { expiresIn });
};

// Method to generate a password reset token
userSchema.methods.getPasswordResetToken = function (this: IUser): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Assign the hashed token to the user document's properties
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration (e.g., 10 minutes)
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Return the unhashed token to be sent to the user
  return resetToken;
};

export default mongoose.model<IUser>('User', userSchema);
