import mongoose, { Document, Schema } from "mongoose";

export interface IOrganization extends Document {
  name: string;
  ownerId: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    ownerId: { type: String, required: true }, // SuperAdmin or Landlord
    status: { type: String, enum: ["active", "suspended"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model<IOrganization>("Organization", OrganizationSchema);