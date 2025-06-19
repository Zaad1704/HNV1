import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role?: string;
  status?: string;
  permissions?: string[];
  organizationId?: mongoose.Types.ObjectId;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  getPasswordResetToken(): string;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  name: { type: String },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  permissions: [{ type: String }],
  organizationId: { type: mongoose.Schema.Types.ObjectId },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date }
});

// Password hashing middleware
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function(): string {
  const payload = { id: this._id };
  const secret = process.env.JWT_SECRET as string;
  const options: SignOptions = { 
    expiresIn: process.env.JWT_EXPIRES_IN || '1d' 
  };
  return jwt.sign(payload, secret, options);
};

// Generate password reset token
userSchema.methods.getPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
