import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "SuperAdmin" | "Landlord" | "Agent" | "Tenant";
  organizationId?: string;
  twoFactorEnabled: boolean;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["SuperAdmin", "Landlord", "Agent", "Tenant"],
      default: "Tenant",
      required: true,
    },
    organizationId: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);