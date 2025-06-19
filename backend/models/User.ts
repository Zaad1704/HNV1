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
      default: 'Tenant'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    permissions: { type: [String], default: [] },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    managedAgentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    associatedLandlordIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: []
    },
    googleId: String,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

// ... (keep all your existing schema methods, but fix the JWT signing):

userSchema.methods.getSignedJwtToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export default mongoose.model<IUser>('User', userSchema);
