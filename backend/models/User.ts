import mongoose, { Schema, Document, model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant'; // Added 'Super Moderator'
  status: 'active' | 'suspended'; // NEW: User status field
  permissions: string[]; // NEW: For moderator permissions
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  address?: string;
  governmentIdUrl?: string;
  getPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Super Moderator', 'Landlord', 'Agent', 'Tenant'], // Added 'Super Moderator'
    default: 'Landlord' 
  },
  status: {
    type: String,
    enum: ['active', 'suspended'], // NEW: Status field with allowed values
    default: 'active'
  },
  permissions: {
    type: [String], // NEW: Array of strings to hold permission keys
    default: []
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  passwordResetToken: String,
  passwordResetExpires: Date,
  address: String,
  governmentIdUrl: String,
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

  const payload = { 
    id: (this._id as Types.ObjectId).toString(), 
    role: this.role, 
    name: this.name,
    permissions: this.permissions // NEW: Include permissions in the JWT payload
  };
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

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};


export default model<IUser>('User', UserSchema);
