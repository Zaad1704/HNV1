import { Schema, model, Document } from 'mongoose';

export interface ISubscription extends Document {
  organizationId: Schema.Types.ObjectId;
  planId: Schema.Types.ObjectId;
  status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due';
  isLifetime: boolean;
  trialExpiresAt?: Date;
  currentPeriodEndsAt?: Date;
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
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
    enum: ["trialing", "active", "inactive", "canceled", "past_due"],
    default: "trialing"
  },
  isLifetime: {
    type: Boolean,
    default: false
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
}, { timestamps: true });

export default model<ISubscription>("Subscription", SubscriptionSchema);