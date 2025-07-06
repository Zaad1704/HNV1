import { Schema, model, Document } from 'mongoose';

export interface ISubscription extends Document {
  organizationId: Schema.Types.ObjectId;
  planId: Schema.Types.ObjectId;
  status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due';
  isLifetime: boolean;
  trialExpiresAt?: Date;
  currentPeriodEndsAt?: Date;
  currentPeriodStartsAt?: Date;
  nextBillingDate?: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily';
  paymentMethod?: string;
  lastPaymentDate?: Date;
  failedPaymentAttempts: number;
  externalId?: string;
  notes?: string;
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
  currentPeriodStartsAt: {
    type: Date,
  },
  nextBillingDate: {
    type: Date,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  canceledAt: {
    type: Date,
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'weekly', 'daily'],
    default: 'monthly'
  },
  paymentMethod: {
    type: String
  },
  lastPaymentDate: {
    type: Date
  },
  failedPaymentAttempts: {
    type: Number,
    default: 0
  },
  externalId: {
    type: String
  },
  notes: {
    type: String
  },
}, { timestamps: true });

export default model<ISubscription>("Subscription", SubscriptionSchema);