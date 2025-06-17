import mongoose, { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  governmentIdUrl?: string;
  address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
  };
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false },
  role: { type: String, enum: ['Super Admin', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
  governmentIdUrl: { type: String },
  address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
  },
}, { timestamps: true });


// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to sign a JWT and return it
UserSchema.methods.getSignedJwtToken = function(): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT Secret is not defined in environment variables.');
  }
  const payload = { id: this._id.toString(), role: this.role, name: this.name };
  const secret: Secret = process.env.JWT_SECRET;
  const options: SignOptions = { 
    expiresIn: process.env.JWT_EXPIRES_IN || '1d' 
  };
  return jwt.sign(payload, secret, options);
};

// Method to generate and hash a password reset token
UserSchema.methods.getPasswordResetToken = function(): string {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to passwordResetToken field in the document
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiration time to 10 minutes from now
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Return the unhashed token (this is what gets sent in the email)
  return resetToken;
};

export default model<IUser>('User', UserSchema);
