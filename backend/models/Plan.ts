import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description?: string;
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
  setupFee: number;
  discountPercentage: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  planType: 'basic' | 'standard' | 'premium' | 'enterprise';
  allowedFeatures: {
    analytics: boolean;
    multipleProperties: boolean;
    tenantPortal: boolean;
    maintenanceTracking: boolean;
    financialReporting: boolean;
    documentStorage: boolean;
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
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
  setupFee: { type: Number, default: 0 },
  discountPercentage: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly', 'one-time'], 
    default: 'monthly' 
  },
  planType: { 
    type: String, 
    enum: ['basic', 'standard', 'premium', 'enterprise'], 
    default: 'standard' 
  },
  allowedFeatures: {
    analytics: { type: Boolean, default: false },
    multipleProperties: { type: Boolean, default: false },
    tenantPortal: { type: Boolean, default: false },
    maintenanceTracking: { type: Boolean, default: false },
    financialReporting: { type: Boolean, default: false },
    documentStorage: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model<IPlan>('Plan', planSchema);