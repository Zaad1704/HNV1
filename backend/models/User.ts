import mongoose, { Schema, Document, model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs'; // Changed to import * as to ensure bcrypt types are found
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  address?: string;
  governmentIdUrl?: string;

  googleId?: string;
  status: string; 

  permissions: string[]; 
  
  managedAgentIds?: mongoose.Types.ObjectId[]; // NEW FIELD: Added managedAgentIds

  getPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Super Admin', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  
  passwordResetToken: String,
  passwordResetExpires: Date,

  address: String,
  governmentIdUrl: String,

  googleId: String,
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  },
  permissions: {
    type: [String],
    default: []
  },
  managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }] // NEW SCHEMA FIELD: for managedAgentIds
});

UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
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
    expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any,
  };

  return jwt.sign(payload, secret, options);
};

UserSchema.methods.getPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export default model<IUser>('User', UserSchema);
