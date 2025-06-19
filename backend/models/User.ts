import mongoose, { Document, Schema } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
  matchPassword?(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  getPasswordResetToken?(): string;
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
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT signing
userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  // If using jsonwebtoken v9+, expiresIn must be a number (seconds)
  const expiresIn = process.env.JWT_EXPIRE ? parseInt(process.env.JWT_EXPIRE, 10) : 60 * 60 * 24 * 30; // 30 days default
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

export default mongoose.model<IUser>("User", userSchema);
