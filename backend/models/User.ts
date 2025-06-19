import mongoose, { Document, Schema } from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  getSignedJwtToken(): string;
  // Add other user fields as needed
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    // Add other fields as needed
  },
  { timestamps: true }
);

// Password encryption middleware
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.getSignedJwtToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  // Explicitly define the options object with the SignOptions type
  const jwtOptions: SignOptions = {
    expiresIn: process.env.JWT_EXPIRE || "30d"
  };

  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    jwtOptions
  );
};

export default mongoose.model<IUser>("User", userSchema);
