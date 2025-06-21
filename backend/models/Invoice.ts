// backend/models/Invoice.ts
import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IInvoice extends Document {
  // Add fields as needed based on generateInvoices controller
  tenantId: Types.ObjectId; // Added
  propertyId: Types.ObjectId; // Added
  organizationId: Types.ObjectId; // Added
  leaseId: Types.ObjectId; // Added
  amount: number;
  dueDate: Date;
  status: string;
  lineItems: { description: string; amount: number; }[]; // Added
}

const InvoiceSchema: Schema<IInvoice> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true }, // Added
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true }, // Added
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }, // Added
  leaseId: { type: Schema.Types.ObjectId, ref: 'Lease', required: true }, // Added
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'overdue', 'canceled'] }, // Added more statuses
  lineItems: [{ // Added
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  }],
}, { timestamps: true }); // Added timestamps for better tracking

export default model<IInvoice>('Invoice', InvoiceSchema);
