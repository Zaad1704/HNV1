import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  // MODIFIED: Added 'Super Moderator' to the role enum
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  // MODIFIED: Made organizationId required for robustness in a multi-tenant app
  organizationId: Schema.Types.ObjectId;
  createdAt: Date;
  managedAgentIds?: Schema.Types.ObjectId[];
  associatedLandlordIds?: Schema.Types.ObjectId[];
  googleId?: string;
  
  // NEW: Fields for password reset
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
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    // MODIFIED: Added 'Super Moderator'
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
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true, // Made required
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

// NEW: Method to generate JWT
userSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || '1d',
  });
};

// NEW: Method to generate password reset token
userSchema.methods.getPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  
  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
