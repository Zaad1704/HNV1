// FILE: backend/models/Organization.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  // NEW: A flag for Super Admins to easily activate/deactivate an account.
  isActive: boolean; 
  settings: {
    logoUrl?: string;
    primaryColor?: string;
  };
  subscription: {
    // UPDATED: Now references a dedicated plan model for more flexibility.
    planId?: mongoose.Schema.Types.ObjectId; 
    status: 'active' | 'inactive' | 'trialing' | 'past_due';
    tcoCustomerId?: string;
    subscriptionId?: string;
    // NEW: The specific date the subscription renews or ends.
    renewalDate?: Date; 
  };
  createdAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  settings: {
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#4f46e5' } // Default to an indigo color
  },
  subscription: {
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    status: { type: String, default: 'trialing' },
    tcoCustomerId: String,
    subscriptionId: String,
    renewalDate: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

export default model<IOrganization>('Organization', OrganizationSchema);
