import mongoose, { Schema, Document, model } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  category: 'Plumbing' | 'Electrical' | 'Appliances' | 'General' | 'Other';
  description: string;
  imageUrl?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
}

const MaintenanceRequestSchema: Schema<IMaintenanceRequest> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'Appliances', 'General', 'Other'],
    required: true,
  },
  description: { type: String, required: true },
  imageUrl: { type: String }, // URL for an optional photo of the issue
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
}, { timestamps: true });

export default model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);
