import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Interface definition remains the same
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Super Moderator' | 'Landlord' | 'Agent' | 'Tenant';
  // ... other properties
  createdAt: Date;
  updatedAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
}

// Schema definition remains the same
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
    // ... other schema fields
  },
  { timestamps: true }
);

// Middleware and other methods remain the same
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generates and signs a JWT for the user.
 * This version reads environment variables directly from the hosting platform (e.g., Render).
 */
userSchema.methods.getSignedJwtToken = function (this: IUser): string {
  // Use type assertion and a clear check for the secret
  const jwtSecret = process.env.JWT_SECRET as string;
  
  if (!jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in the deployment environment.');
    throw new Error('Server configuration error: JWT secret is missing.');
  }

  // Set the expiration, providing a default value
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign(
    { id: this._id, role: this.role }, // 1. Payload
    jwtSecret,                         // 2. Secret
    { expiresIn }                      // 3. Options
  );
};

userSchema.methods.getPasswordResetToken = function (this: IUser): string {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

export default mongoose.model<IUser>('User', userSchema);
