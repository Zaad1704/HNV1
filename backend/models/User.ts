import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Export the interface for use in other parts of your application
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

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method for signing a JWT (This is the section with the fix)
userSchema.methods.getSignedJwtToken = function (): string {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    throw new Error('JWT_SECRET is not defined');
  }
  // The signature MUST be: jwt.sign(payload, secret, options)
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Method to generate a password reset token
userSchema.methods.getPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token to expire in 10 minutes
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export default mongoose.model<IUser>('User', userSchema);
