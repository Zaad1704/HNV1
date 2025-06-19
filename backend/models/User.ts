import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs'; // CORRECTED IMPORT

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'manager' | 'agent' | 'tenant';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  organizationId?: Schema.Types.ObjectId;
  createdAt: Date;
  managedAgentIds?: Schema.Types.ObjectId[];
  associatedLandlordIds?: Schema.Types.ObjectId[];
  googleId?: string; // For Google OAuth
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema = new Schema({
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
    // Password is not required for OAuth users
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'manager', 'agent', 'tenant'],
    default: 'tenant',
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
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save middleware to hash password
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
