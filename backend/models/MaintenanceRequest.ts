import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceRequest extends Document {
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  requestedBy: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'urgent';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  category?: string;
  notes?: string;
  assignedTo?: mongoose.Types.ObjectId;
  estimatedCost?: number;
  actualCost?: number;
  completedAt?: Date;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRequestSchema = new Schema<IMaintenanceRequest>({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  description: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed', 'Cancelled'], default: 'Open' },
  category: { type: String },
  notes: { type: String },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  estimatedCost: { type: Number, min: 0 },
  actualCost: { type: Number, min: 0 },
  completedAt: { type: Date },
  images: [{ type: String }]
}, { timestamps: true });

// Add indexes for better performance
MaintenanceRequestSchema.index({ organizationId: 1, status: 1 });
MaintenanceRequestSchema.index({ propertyId: 1, createdAt: -1 });
MaintenanceRequestSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model<IMaintenanceRequest>('MaintenanceRequest', MaintenanceRequestSchema);