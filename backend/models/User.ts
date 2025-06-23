import mongoose, { Schema, Document, model, Types } from 'mongoose'; // FIX: Import Types
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto'; // FIX: Import crypto for password reset token generation

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;

  // FIX: New fields for password reset (from passwordResetController errors)
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // FIX: New fields for user profile (from userController errors, assuming optional)
  address?: string;
  governmentIdUrl?: string;

  // FIX: New fields for Google OAuth integration (from passport-setup errors)
  googleId?: string;
  status: string; // Add status property (from superAdminController and authMiddleware errors)

  // FIX: New method for password reset token generation (from passwordResetController errors)
  getPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Super Admin', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  
  // FIX: Add schema fields for password reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // FIX: Add schema fields for user profile (assuming optional)
  address: String,
  governmentIdUrl: String,

  // FIX: Add schema fields for Google OAuth integration
  googleId: String,
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'], // Example statuses, adjust as needed
    default: 'active'
  }
});

UserSchema.pre<IUser>('save', async function(next) {
  // FIX: Check if password exists before hashing
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  if (!this.password) return false; // FIX: Ensure password exists
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT Secret is not defined in environment variables.');
  }

  const payload = { id: (this._id as Types.ObjectId).toString(), role: this.role, name: this.name };
  const secret: Secret = process.env.JWT_SECRET;
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any, // FIX: Use 'as any' for expiresIn
  };

  return jwt.sign(payload, secret, options);
};

// FIX: Method to generate and hash password reset token (from passwordResetController errors)
UserSchema.methods.getPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  return resetToken;
};


export default model<IUser>('User', UserSchema);
