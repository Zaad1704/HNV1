// backend/models/SiteSettings.ts

import mongoose, { Schema, Document, model, Types } from 'mongoose';

// --- Sub-document Interfaces ---
export interface ILink {
  text: string;
  url: string;
}

export interface IFeature {
    icon: string;
    title: string;
    text: string;
}

export interface IExecutive {
  name: string;
  title: string;
  imageUrl: string;
}

export interface ICorporateAddress {
    locationName: string;
    fullAddress: string;
    phone: string;
    email: string;
}

// --- Main Settings Interface ---
export interface ISiteSettings extends Document {
  logos: {
    companyName: string;
    navbarLogoUrl: string;
    footerLogoUrl: string;
    faviconUrl: string;
  };
  heroSection: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImageUrl: string;
  };
  featuresPage: {
    title: string;
    subtitle: string;
    backgroundImageUrl: string;
axTenants: number;
    maxAgents: number;
  };
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
