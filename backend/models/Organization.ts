import mongoose, { Schema, Document, model } from 'mongoose';

// FIX: Added missing properties to the interface to match their usage in controllers
export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  members: mongoose.Types.ObjectId[]; // FIX: Changed to mongoose.Types.ObjectId[]
  status: 'active' | 'inactive' | 'pending_deletion';
  subscription: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
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
  // FIX: Changed subscription from an object to a reference to the Subscription model
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  dataManagement: {
    dataExportRequestedAt: Date,
    accountDeletionRequestedAt: Date,
  },
}, { timestamps: true });

export default model<IOrganization>('Organization', OrganizationSchema);
