import mongoose, { Schema, Document } from 'mongoose';

export interface IReceipt extends Document {
  tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  receiptNumber: string;
  handwrittenReceiptNumber?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  rentMonth?: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
  receiptNumber: { type: String, required: true, unique: true },
  handwrittenReceiptNumber: { type: String },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, required: true },
  rentMonth: { type: String },
  tenantName: { type: String, required: true },
  propertyName: { type: String, required: true },
  unitNumber: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IReceipt>('Receipt', ReceiptSchema);