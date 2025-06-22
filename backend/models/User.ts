// backend/models/User.ts

import mongoose, { Document, Schema, Model } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Define the allowed roles as a specific type
type UserRole = "Super Admin" | "Super Moderator" | "Landlord" | "Agent" | "Tenant";

// Extend this interface as needed for your app
export interface IUser extends Document {
  email: string;
  password?: string; // Password can be optional for Google OAuth users
  role: UserRole;
  name?: string;
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[]; // THE FIX: This is now a required property
  organizationId?: mongoose.Types.ObjectId;
  googleId?: string; // For Google OAuth
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  managedAgentIds?: mongoose.Types.ObjectId[];
  associatedLandlordIds?: mongoose.Types.ObjectId[];
  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },
    role: {
        type: String,
        required: true,
        enum: ["Super Admin", "Super Moderator", "Landlord", "Agent", "Tenant"],
        default: "Tenant"
    },
    name: { type: String },
    googleId: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    // THE FIX: Provide a default value for the permissions array
    permissions: { type: [String], default: [] },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    managedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    associatedLandlordIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  const expiresIn = process.env.JWT_EXPIRE ? parseInt(process.env.JWT_EXPIRE, 10) : 60 * 60 * 24 * 30;
  const jwtOptions: SignOptions = { expiresIn };
  return jwt.sign({ id: this._id, role: this.role, orgId: this.organizationId }, process.env.JWT_SECRET, jwtOptions);
};

// Generate and hash password reset token
userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
