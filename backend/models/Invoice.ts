import mongoose, { Schema, Document, model } from 'mongoose';

export interface IInvoice extends Document {
  tenantId: mongoose.Schema.Types.ObjectId;
  propertyId: mongoose.Schema.Types.ObjectId;
  organizationId: mongoose.Schema.Types.ObjectId;
  leaseId: mongoose.Schema.Types.ObjectId;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'late';
  lineItems: [{
    description: string;
    amount: number;
  }];
}

const InvoiceSchema: Schema<IInvoice> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  leaseId: { type: Schema.Types.ObjectId, ref: 'Lease', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['pending', 'paid', 'late'], default: 'pending' },
  lineItems: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }]
}, { timestamps: true });

export default model<IInvoice>('Invoice', InvoiceSchema);
