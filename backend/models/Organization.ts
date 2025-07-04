import { Schema, model, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: Schema.Types.ObjectId;
  members: Schema.Types.ObjectId[];
  status: 'active' | 'inactive' | 'pending_deletion';
  subscription: Schema.Types.ObjectId;
  branding: {
    companyName: string;
    companyLogoUrl: string;
    companyAddress: string;
  };
  dataManagement: {
    dataExportRequestedAt?: Date;
    accountDeletionRequestedAt?: Date;
  };
  allowSelfDeletion: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'inactive', 'pending_deletion'], default: 'active' },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  branding: {
    companyName: { type: String, default: '' },
    companyLogoUrl: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
  },
  dataManagement: {
    dataExportRequestedAt: Date,
    accountDeletionRequestedAt: Date,
  },
  allowSelfDeletion: { type: Boolean, default: true },
}, { timestamps: true });

export default model<IOrganization>('Organization', OrganizationSchema);