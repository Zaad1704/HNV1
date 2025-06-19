import mongoose, { Schema, Document, Types } from 'mongoose'; // CORRECTED: Import 'Types'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Interface for the User document
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id as the correct type
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  organizationId: Types.ObjectId; // Use Types.ObjectId
  createdAt: Date;
  managedAgentIds?: Types.ObjectId[];
  associatedLandlordIds?: Types.ObjectId[];
  googleId?: string;
  
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Method declarations
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
}

const userSchema: Schema<IUser> = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false,
  },
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
  permissions: {
    type: [String],
    default: [],
  },
  organizationId: {
    type: Schema.Types.ObjectId, // Schema definition uses Schema.Types
    ref: 'Organization',
    required: true,
  },
  managedAgentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  associatedLandlordIds: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
  }],
  googleId: {
    type: String,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT
userSchema.methods.getSignedJwtToken = function (): string {
    // CORRECTED: The payload is the first argument, the secret is the second.
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRE || '1d',
    });
};

// Method to generate password reset token
userSchema.methods.getPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes
  
  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
