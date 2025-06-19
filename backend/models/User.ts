import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// --- FIX: Import the built-in Node.js crypto module ---
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

// --- FIX: Explicitly type 'this' for matchPassword ---
userSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- FIX: Corrected and verified ---
userSchema.methods.getSignedJwtToken = function (this: IUser): string {
  const jwtSecret = process.env.JWT_SECRET as string;
  if (!jwtSecret) {
    throw new Error('Server configuration error: JWT secret is missing.');
  }
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  return jwt.sign({ id: this._id, role: this.role }, jwtSecret, { expiresIn });
};

// --- FIX: Corrected and verified ---
userSchema.methods.getPasswordResetToken = function (this: IUser): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};

// This middleware must be defined BEFORE the model is created
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model<IUser>('User', userSchema);
