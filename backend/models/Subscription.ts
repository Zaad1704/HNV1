import mongoose, { Document, Schema, model } from "mongoose";

export interface ISubscription extends Document {
  organizationId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: "trialing" | "active" | "inactive" | "canceled" | "past_due"; // Added 'inactive'
  isLifetime: boolean; // NEW: Field for lifetime access
  trialExpiresAt?: Date;
  currentPeriodEndsAt?: Date;
  externalId?: string; 
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization',
      required: true 
    },
    planId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Plan',
      required: true 
    },
    status: { 
      type: String, 
      enum: ["trialing", "active", "inactive", "canceled", "past_due"], // Added 'inactive'
      default: "trialing" 
    },
    isLifetime: {
      type: Boolean,
      default: false // NEW: Default to false
    },
    trialExpiresAt: {
      type: Date,
    },
    currentPeriodEndsAt: {
      type: Date,
    },
    externalId: { 
      type: String 
    },
  },
  { timestamps: true }
);

export default model<ISubscription>("Subscription", SubscriptionSchema);
