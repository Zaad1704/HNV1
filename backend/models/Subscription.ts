// backend/models/Subscription.ts

import mongoose, { Document, Schema, model } from "mongoose";

export interface ISubscription extends Document {
  organizationId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  status: "trialing" | "active" | "canceled" | "past_due";
  trialExpiresAt?: Date; // <-- NEW FIELD for the 7-day trial
  currentPeriodEndsAt?: Date;
  externalId?: string; // ID from the payment processor like 2Checkout or Stripe
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
      enum: ["trialing", "active", "canceled", "past_due"], 
      default: "trialing" 
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
