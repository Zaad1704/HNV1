import mongoose, { Schema, Document, model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId;
  members: mongoose.Schema.Types.ObjectId[];
  status: 'active' | 'suspended_by_admin' | 'pending_deletion' | 'trialing';
  settings: { logoUrl?: string; primaryColor?: string; customDomain?: string; };
  subscription: { planId?: mongoose.Schema.Types.ObjectId; status: string; renewalDate?: Date; trialEndsAt?: Date; };
  createdAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'suspended_by_admin', 'pending_deletion', 'trialing'], default: 'trialing' },
  settings: {
    logoUrl: String,
    primaryColor: String,
    customDomain: String,
  },
  subscription: {
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
    status: { type: String, default: 'trialing' },
    renewalDate: Date,
    trialEndsAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

export default model<IOrganization>('Organization', OrganizationSchema);


// ==========================================================

// FILE: backend/models/SiteContent.ts
import mongoose, { Schema, Document, model } from 'mongoose';

export interface ISiteContent extends Document {
    page: string;
    content: Map<string, any>;
    lastUpdated: Date;
}

const SiteContentSchema: Schema<ISiteContent> = new Schema({
    page: { type: String, required: true, unique: true },
    content: { type: Map, of: mongoose.Schema.Types.Mixed },
    lastUpdated: { type: Date, default: Date.now },
});

export default model<ISiteContent>('SiteContent', SiteContentSchema);
