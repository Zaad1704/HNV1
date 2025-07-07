import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  amount: number;
  originalAmount?: number;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
  status: 'pending' | 'Paid' | 'completed' | 'Completed' | 'failed';
  paymentDate: Date;
  createdBy?: mongoose.Types.ObjectId;
  recordedBy?: mongoose.Types.ObjectId;
  paymentMethod?: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  amount: { type: Number, required: true, min: 0 },
  originalAmount: { type: Number, min: 0 },
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    value: { type: Number, min: 0 },
    amount: { type: Number, min: 0 }
  },
  status: { 
    type: String, 
    enum: ['pending', 'Paid', 'completed', 'Completed', 'failed'], 
    default: 'pending' 
  },
  paymentDate: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  description: { type: String, default: 'Monthly Rent Payment' },
  notes: { type: String },
}, { timestamps: true });

// Add indexes for better performance
PaymentSchema.index({ organizationId: 1, paymentDate: -1 });
PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ propertyId: 1, paymentDate: -1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
