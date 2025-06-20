// backend/models/Plan.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPlanLimits {
  maxProperties: number;
  maxTenants: number;
  maxAgents: number;
}

export interface IPlan extends Document {
  name: string;
  price: number; // Stored in cents
  duration: 'daily' | 'weekly' | 'monthly' | 'yearly';
  features: string[];
  limits: IPlanLimits;
  isPublic: boolean;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    duration: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    features: { type: [String], default: [] },
    limits: {
      maxProperties: { type: Number, default: 1 },
      maxTenants: { type: Number, default: 5 },
      maxAgents: { type: Number, default: 0 },
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPlan>('Plan', planSchema);
