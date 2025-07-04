import mongoose, { Schema, Document } from 'mongoose';

export interface ICashFlow extends Document {
  organizationId: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toUser?: mongoose.Types.ObjectId;
  amount: number;
  type: 'cash_handover' | 'bank_deposit';
  status: 'pending' | 'completed';
  transactionDate: Date;
  description?: string;
  documentUrl?: string;
  recordedBy: mongoose.Types.ObjectId;
}

const CashFlowSchema = new Schema<ICashFlow>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['cash_handover', 'bank_deposit'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  transactionDate: { type: Date, default: Date.now, required: true },
  description: { type: String },
  documentUrl: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<ICashFlow>('CashFlow', CashFlowSchema);