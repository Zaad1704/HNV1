import mongoose, { Schema, Document, model } from 'mongoose';

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  propertyId: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  organizationId: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  recordedBy: mongoose.Types.ObjectId; // FIX: Changed to mongoose.Types.ObjectId
  amount: number;
  paymentDate: Date;
  status: 'Paid' | 'Pending' | 'Failed';
  transactionId?: string;
}

const PaymentSchema: Schema<IPayment> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  transactionId: { type: String },
}, { timestamps: true });

export default model<IPayment>('Payment', PaymentSchema);
