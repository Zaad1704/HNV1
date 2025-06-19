import mongoose, { Document, Schema, Model } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Extend this interface as needed for your app
export interface IUser extends Document {
  email: string;
  password: string;
  role: string;
  name?: string;
  status?: string;
  permissions?: string[];
  organizationId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  managedAgentIds?: string[];
  associatedLandlordIds?: string[];
  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, required: true, default: "user" },
    name: { type: String },
    status: { type: String },
    permissions: [{ type: String }],
    organizationId: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    managedAgentIds: [{ type: String }],
    associatedLandlordIds: [{ type: String }],
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  // For jsonwebtoken v9+, expiresIn must be a number (seconds)
  const expiresIn = process.env.JWT_EXPIRE ? parseInt(process.env.JWT_EXPIRE, 10) : 60 * 60 * 24 * 30;
  const jwtOptions: SignOptions = { expiresIn };
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, jwtOptions);
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
