import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  orgId: string;
  plan: string;
  status: "active" | "canceled" | "past_due";
  renewalDate: Date;
  externalId?: string; // 2Checkout subscription id
}

const SubscriptionSchema = new Schema(
  {
    orgId: { type: String, required: true },
    plan: { type: String, required: true },
    status: { type: String, enum: ["active", "canceled", "past_due"], default: "active" },
    renewalDate: { type: Date, required: true },
    externalId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>("Subscription", SubscriptionSchema);