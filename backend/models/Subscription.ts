import { Schema, model, Document } from 'mongoose';

export interface ISubscription extends Document {
  organizationId: Schema.Types.ObjectId;
  planId: Schema.Types.ObjectId;
  status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due' | 'expired';
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
  // Usage tracking
  maxProperties: number;
  maxTenants: number;
  maxAgents: number;
  maxUsers: number;
  currentProperties: number;
  currentTenants: number;
  currentAgents: number;
  currentUsers: number;
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
    enum: ["trialing", "active", "inactive", "canceled", "past_due", "expired"],
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
  // Usage limits
  maxProperties: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  maxTenants: {
    type: Number,
    default: -1
  },
  maxAgents: {
    type: Number,
    default: -1
  },
  maxUsers: {
    type: Number,
    default: -1
  },
  // Current usage
  currentProperties: {
    type: Number,
    default: 0
  },
  currentTenants: {
    type: Number,
    default: 0
  },
  currentAgents: {
    type: Number,
    default: 0
  },
  currentUsers: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

export default model<ISubscription>("Subscription", SubscriptionSchema);