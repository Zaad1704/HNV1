import mongoose, { Schema, Document, model } from 'mongoose';

// --- NEW: Interface for the branding sub-document ---
export interface IBranding {
  companyName: string;
  companyLogoUrl: string;
  companyAddress: string;
}

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'pending_deletion';
  subscription: mongoose.Types.ObjectId;
  branding?: IBranding; // Add the optional branding field
  dataManagement?: {
    dataExportRequestedAt?: Date;
    accountDeletionRequestedAt?: Date;
  };
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'inactive', 'pending_deletion'], default: 'active' },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  
  // --- NEW: Branding Schema ---
  branding: {
    companyName: { type: String, default: '' },
    companyLogoUrl: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
  },

  dataManagement: {
    dataExportRequestedAt: Date,
    accountDeletionRequestedAt: Date,
  },
}, { timestamps: true });

export default model<IOrganization>('Organization', OrganizationSchema);
