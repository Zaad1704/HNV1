import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  duration: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxProperties: number;
    maxTenants: number;
    maxAgents: number;
  };
  maxProperties: number;
  maxUsers: number;
  maxTenants: number;
  maxAgents: number;
  isPublic: boolean;
  isActive: boolean;
  isPopular: boolean;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  duration: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  interval: {
    type: String,
    enum: ['month', 'monthly', 'yearly'],
    default: 'monthly'
  },
  features: { type: [String], default: [] },
  limits: {
    maxProperties: { type: Number, default: 1 },
    maxTenants: { type: Number, default: 5 },
    maxAgents: { type: Number, default: 0 },
  },
  maxProperties: { type: Number, default: 1 },
  maxUsers: { type: Number, default: 1 },
  maxTenants: { type: Number, default: 5 },
  maxAgents: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  trialDays: { type: Number, default: 14 },
}, { timestamps: true });

export default mongoose.model<IPlan>('Plan', planSchema);