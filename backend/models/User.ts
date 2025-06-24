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
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;

  passwordResetToken?: string;
  passwordResetExpires?: Date;

  address?: string;
  governmentIdUrl?: string;

  googleId?: string;
  status: string; 
  permissions: string[]; 
  managedAgentIds?: mongoose.Types.ObjectId[];
  getPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // --- SOLUTION: Make password conditionally required ---
  password: { 
    type: String, 
    required: function(this: IUser): boolean {
        // Only require a password if googleId is not set
        return !this.googleId;
    },
    select: false 
  },
  
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
  managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// Pre-save hook for hashing password
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methods remain the same
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> { /* ... */ };
UserSchema.methods.getSignedJwtToken = function(): string { /* ... */ };
UserSchema.methods.getPasswordResetToken = function(): string { /* ... */ };

export default model<IUser>('User', UserSchema);
