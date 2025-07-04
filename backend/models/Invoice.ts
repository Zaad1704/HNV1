// backend/models/Invoice.ts
import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IInvoice extends Document { tenantId: Types.ObjectId;
  propertyId: Types.ObjectId;
  organizationId: Types.ObjectId;
  leaseId: Types.ObjectId;
  invoiceNumber: string; // NEW FIELD: Unique identifier for the invoice
  amount: number;
  dueDate: Date;

  status: 'pending' | 'paid' | 'overdue' | 'canceled'; }

  lineItems: { description: string; amount: number; }[];
  paidAt?: Date; // NEW FIELD: When the invoice was paid
  transactionId?: string; // NEW FIELD: Link to payment transaction

const InvoiceSchema: Schema<IInvoice> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  leaseId: { type: Schema.Types.ObjectId, ref: 'Lease', required: true },
  invoiceNumber: { type: String, required: true, unique: true }, // NEW SCHEMA FIELD
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'overdue', 'canceled'] },
  lineItems: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
  }],
  paidAt: { type: Date }, // NEW SCHEMA FIELD
  transactionId: { type: String }, // NEW SCHEMA FIELD;
}, { timestamps: true });

export default model
export default model<IInvoice>('Invoice', InvoiceSchema);
