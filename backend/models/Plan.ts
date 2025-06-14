import mongoose, { Schema, Document, model } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number; // Price in cents (e.g., 1000 for $10.00)
  currency: string;
  duration: 'monthly' | 'yearly'; // Time slot for the plan
  features: string[];
  isPublic: boolean;
  limits: {
    maxProperties: number;
    maxTenants: number;
    maxAgents: number;
  };
}

const PlanSchema: Schema<IPlan> = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true, default: 'USD' },
  duration: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  features: { type: [String], default: [] },
  isPublic: { type: Boolean, default: true },
  limits: {
    maxProperties: { type: Number, default: 1 },
    maxTenants: { type: Number, default: 5 },
    maxAgents: { type: Number, default: 1 },
  },
}, { timestamps: true });

export default model<IPlan>('Plan', PlanSchema);
