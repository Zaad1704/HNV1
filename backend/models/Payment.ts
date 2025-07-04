import mongoose, { Schema, Document, model } from 'mongoose';

export interface IPayment extends Document { tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  status: 'Paid' | 'Pending' | 'Failed';
  transactionId?: string;

  // NEW FIELDS for Payment Breakdown; }

  lineItems?: { description: string; amount: number; }[]; // e.g., Rent, Maintenance, Utilities
  paidForMonth?: Date; // The month for which this payment applies;

const PaymentSchema: Schema<IPayment> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  transactionId: { type: String },
  // NEW SCHEMA FIELDS
  lineItems: [{ // Array of sub-documents; }

    description: { type: String, required: true },
    amount: { type: Number, required: true },
  }],
  paidForMonth: { type: Date }, // Store as Date, frontend can send 'YYYY-MM-DD'
}, { timestamps: true });

export default model
export default model<IPayment>('Payment', PaymentSchema);
