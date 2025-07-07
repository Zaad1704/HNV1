import { Schema, model, Document } from 'mongoose';

export interface IApprovalRequest extends Document {
  type: 'property_edit' | 'tenant_delete' | 'payment_modify' | 'expense_add' | 'maintenance_close' | 'other';
  description: string;
  requestedBy: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  propertyId?: Schema.Types.ObjectId;
  tenantId?: Schema.Types.ObjectId;
  paymentId?: Schema.Types.ObjectId;
  expenseId?: Schema.Types.ObjectId;
  maintenanceId?: Schema.Types.ObjectId;
  requestData: any;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema = new Schema<IApprovalRequest>({
  type: { 
    type: String, 
    enum: ['property_edit', 'tenant_delete', 'payment_modify', 'expense_add', 'maintenance_close', 'other'],
    required: true 
  },
  description: { type: String, required: true },
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  expenseId: { type: Schema.Types.ObjectId, ref: 'Expense' },
  maintenanceId: { type: Schema.Types.ObjectId, ref: 'MaintenanceRequest' },
  requestData: { type: Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }
}, { timestamps: true });

// Add indexes for better performance
ApprovalRequestSchema.index({ organizationId: 1, status: 1 });
ApprovalRequestSchema.index({ requestedBy: 1, createdAt: -1 });

export default model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);