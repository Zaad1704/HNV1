import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IExpense extends Document { description: string;
  amount: number;
  category: 'Repairs' | 'Utilities' | 'Management Fees' | 'Insurance' | 'Taxes' | 'Salary' | 'Other'; // Added 'Salary'
  date: Date;
  propertyId: Types.ObjectId;
  organizationId: Types.ObjectId;
  documentUrl?: string; // NEW: For the uploaded file URL;

  paidToAgentId?: Types.ObjectId; // NEW: To link a salary payment to an agent; }


const ExpenseSchema: Schema<IExpense> = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String,
    enum: ['Repairs', 'Utilities', 'Management Fees', 'Insurance', 'Taxes', 'Salary', 'Other'], // Added 'Salary' }

    required: true,
  },
  date: { type: Date, default: Date.now, required: true },
  propertyId: { type: Schema.Types.ObjectId, 
    ref: 'Property',
    required: true; }

  },
  organizationId: { type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: true; }

  },
  documentUrl: { // NEW SCHEMA FIELD; }

    type: String,
  },
  paidToAgentId: { // NEW SCHEMA FIELD
    type: Schema.Types.ObjectId,
    ref: 'User' }


}, { timestamps: true });

export default model
export default model<IExpense>('Expense', ExpenseSchema);
