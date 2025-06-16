import mongoose, { Schema, Document, model } from 'mongoose';

// Interface for a single content section
export interface IContentSection {
  title: string;
  subtitle: string;
  ctaText?: string; // Optional call-to-action text
  backgroundImageUrl?: string;
}

// Main interface for the SiteSettings document
export interface ISiteSettings extends Document {
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  logos: {
    navbarLogoUrl: string;
    faviconUrl: string;
  };
  heroSection: IContentSection;
  featuresSection: {
    title: string;
    subtitle: string;
    feature1Title: string;
    feature1Text: string;
    feature2Title: string;
    feature2Text: string;
    feature3Title: string;
    feature3Text: string;
  };
  // Add other sections like 'about', 'pricing', 'cta' as needed
  updatedBy: mongoose.Types.ObjectId;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema({
  theme: {
    primaryColor: { type: String, default: '#4F46E5' }, // Default to an indigo color
    secondaryColor: { type: String, default: '#F59E0B' }, // Default to a yellow/amber color
  },
  logos: {
    navbarLogoUrl: { type: String, default: 'https://placehold.co/40x40/f59e0b/0f172a?text=HNV' },
    faviconUrl: { type: String, default: '/favicon.svg' },
  },
  heroSection: {
    title: { type: String, default: 'The All-in-One Platform for Modern Property Management' },
    subtitle: { type: String, default: 'Automate tasks, track finances, and manage tenants with ease.' },
    ctaText: { type: String, default: 'Start Your Free Trial' },
    backgroundImageUrl: { type: String, default: `https://picsum.photos/id/1074/1920/1080` },
  },
  featuresSection: {
    title: { type: String, default: 'Powerful Tools for Every Role' },
    subtitle: { type: String, default: 'From individual landlords to large agencies, our platform is designed to fit your needs.' },
    feature1Title: { type: String, default: 'Centralized Dashboard' },
    feature1Text: { type: String, default: "View properties, tenants, and payments at a glance." },
    feature2Title: { type: String, default: 'Secure Document Storage' },
    feature2Text: { type: String, default: 'Upload and manage lease agreements and important documents.' },
    feature3Title: { type: String, default: 'Audit Trails & Security' },
    feature3Text: { type: String, default: 'Track every important action with a detailed audit log.' },
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Ensure only one settings document can exist
SiteSettingsSchema.index({ updatedBy: 1 }, { unique: true });

export default model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
