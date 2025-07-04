import mongoose, { Document, Schema } from "mongoose";
export interface IOrgInvitation extends Document { orgId: string,;
  email: string,;
  role: "Agent" | "Landlord" | "Tenant",;
  token: string,;
  status: "pending" | "accepted" | "expired",;
  expiresAt: Date};
const OrgInvitationSchema: new Schema();
  {
orgId: { type: String, required: true
},;
    email: { type: String, required: true },;
    role: { type: String, enum: ["Agent", "Landlord", "Tenant"], required: true },;
    token: { type: String, required: true, unique: true },;
    status: { type: String, enum: ["pending", "accepted", "expired"], default: "pending" },;
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
export default mongoose.model<IOrgInvitation>("OrgInvitation", OrgInvitationSchema);