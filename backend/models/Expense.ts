import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  category: 'Repairs' | 'Utilities' | 'Management Fees' | 'Insurance' | 'Taxes' | 'Salary' | 'Other';
  date: Date;
  propertyId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  documentUrl?: string;
  paidToAgentId?: mongoose.Types.ObjectId;
}

const ExpenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String,
    enum: ['Repairs', 'Utilities', 'Management Fees', 'Insurance', 'Taxes', 'Salary', 'Other'],
    required: true
  },
  date: { type: Date, default: Date.now, required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  documentUrl: { type: String },
  paidToAgentId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);