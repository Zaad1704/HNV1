import mongoose, { Schema, Document, model } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  category: 'Repairs' | 'Utilities' | 'Management Fees' | 'Insurance' | 'Taxes' | 'Other';
  date: Date;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
}

const ExpenseSchema: Schema<IExpense> = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Repairs', 'Utilities', 'Management Fees', 'Insurance', 'Taxes', 'Other'],
    required: true,
  },
  date: { type: Date, default: Date.now, required: true },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property',
    required: true 
  },
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true 
  },
}, { timestamps: true });

export default model<IExpense>('Expense', ExpenseSchema);
