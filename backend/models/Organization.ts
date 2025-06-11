// FILE: backend/models/Organization.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  // UPDATED: A more descriptive status for better admin control
  status: 'active' | 'suspended_by_admin' | 'pending_deletion' | 'trialing';
  settings: {
    logoUrl?: string;
    primaryColor?: string;
    // NEW: Field for full white-labeling support
    customDomain?: string;
  };
  subscription: {
    planId?: mongoose.Schema.Types.ObjectId; 
    status: 'active' | 'inactive' | 'trialing' | 'past_due';
    tcoCustomerId?: string;
    subscriptionId?: string;
    renewalDate?: Date;
    // NEW: A dedicated field for trial periods.
    trialEndsAt?: Date;
  };
  // NEW: Object to manage data export and deletion requests
  dataManagement: {
      lastDataExportUrl?: string;
      dataExportRequestedAt?: Date;
      accountDeletionRequestedAt?: Date;
  };
  createdAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'suspended_by_admin', 'pending_deletion', 'trialing'], default: 'trialing' },
  settings: {
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#4f46e5' },
    customDomain: { type: String, default: '' },
  },
  subscription: {
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    status: { type: String, default: 'trialing' },
    tcoCustomerId: String,
    subscriptionId: String,
    renewalDate: Date,
    trialEndsAt: Date,
  },
  dataManagement: {
      lastDataExportUrl: String,
      dataExportRequestedAt: Date,
      accountDeletionRequestedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

export default model<IOrganization>('Organization', OrganizationSchema);
