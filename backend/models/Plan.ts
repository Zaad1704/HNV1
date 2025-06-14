// backend/models/Plan.ts

import mongoose, { Schema, Document, model } from 'mongoose';

// This interface defines all the attributes of a subscription plan
export interface IPlan extends Document {
  name: string; // e.g., "Landlord Plan", "Agent Plan"
  price: number; // Price in cents to avoid floating point issues (e.g., 1000 for $10.00)
  currency: string; // e.g., "USD"
  features: string[]; // A list of features for this plan
  isPublic: boolean; // Controls if the plan is visible on the pricing page
  legacy: boolean; // Marks old plans that are no longer offered but still active for some users
}

const PlanSchema: Schema<IPlan> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  features: {
    type: [String],
    default: [],
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  legacy: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default model<IPlan>('Plan', PlanSchema);
