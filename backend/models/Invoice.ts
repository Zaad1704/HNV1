import mongoose, { Schema, Document, model } from 'mongoose';

export interface IInvoice extends Document {
  // Add fields as needed
  amount: number;
  dueDate: Date;
  status: string;
}

const InvoiceSchema: Schema<IInvoice> = new Schema({
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'pending' },
});

export default model<IInvoice>('Invoice', InvoiceSchema);
