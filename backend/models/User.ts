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
  managedAgentIds?: Types.ObjectId[];
  associatedLandlordIds?: Types.ObjectId[];
  googleId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;

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
    managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    associatedLandlordIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    googleId: String,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

export default mongoose.model<IUser>('User', userSchema);
