import mongoose, { Schema, Document, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Landlord' | 'Agent' | 'Tenant';
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Super Admin', 'Landlord', 'Agent', 'Tenant'], default: 'Landlord' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
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
  // FIX: Assert process.env.JWT_SECRET as string
  return jwt.sign({ id: this._id, role: this.role, name: this.name }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

export default model<IUser>('User', UserSchema);
