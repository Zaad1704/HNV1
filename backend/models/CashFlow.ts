// backend/models/CashFlow.ts

import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface ICashFlow extends Document {
  organizationId: Types.ObjectId;
  fromUser: Types.ObjectId; // The user (Agent) who handled the cash
  toUser?: Types.ObjectId; // The user (Landlord) who received the cash, or null if deposited to bank
  amount: number;
  type: 'cash_handover' | 'bank_deposit';
  status: 'pending' | 'completed'; // e.g., pending handover, completed deposit
  transactionDate: Date;
  description?: string;
  documentUrl?: string; // URL to an uploaded receipt/proof (e.g., from Google Drive)
  recordedBy: Types.ObjectId; // The user who created this record (Agent)

const CashFlowSchema: Schema<ICashFlow> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Agent
  toUser: { type: Schema.Types.ObjectId, ref: 'User' }, // Landlord (optional)
  amount: { type: Number, required: true },
  type: { type: String, enum: ['cash_handover', 'bank_deposit'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  transactionDate: { type: Date, default: Date.now, required: true },
  description: { type: String },
  documentUrl: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default model<ICashFlow>('CashFlow', CashFlowSchema);
