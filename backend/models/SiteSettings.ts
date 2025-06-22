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
  bio?: string; // Optional bio field
}

export interface ICorporateAddress {
    locationName: string;
    fullAddress: string;
    phone: string;
    email: string;
}

export interface ILegalContent {
  title: string;
  lastUpdated: string;
  content: string;
}

// NEW: Interface for a Service Item
export interface IService {
    icon: string;
    title: string;
    text: string;
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
    features: IFeature[];
  };
  // NEW: Services Section
  servicesSection: {
      title: string;
      subtitle: string;
      services: IService[];
  };
  aboutPage: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionStatement: string;
    visionTitle: string;
    visionStatement: string;
    imageUrl: string;
    teamTitle: string;
    teamSubtitle: string;
    backgroundImageUrl: string;
    executives: IExecutive[];
  };
  // NEW: Leadership Section (separated from About for distinct control)
  leadershipSection: {
      title: string;
      subtitle: string;
  };
  pricingSection: {
    title: string;
    subtitle: string;
    backgroundImageUrl: string;
    disclaimer: string;
  };
  installAppSection: {
    title: string;
    subtitle: string;
    backgroundImageUrl: string;
  };
  contactPage: {
    title: string;
    subtitle: string;
    formTitle: string;
    backgroundImageUrl: string;
    addresses: ICorporateAddress[];
  };
  footer: {
    description: string;
    copyrightText: string;
    quickLinks: ILink[];
    legalLinks: ILink[];
    socialLinks: ILink[];
  };
  termsPageContent?: ILegalContent;
  privacyPolicyPageContent?: ILegalContent;
  updatedBy: Types.ObjectId;
}

// --- Mongoose Schema ---
const SiteSettingsSchema: Schema<ISiteSettings> = new Schema({
  logos: {
    companyName: { type: String, default: 'HNV Solutions' },
    navbarLogoUrl: { type: String, default: 'https://placehold.co/160x40/0f172a/f59e0b?text=HNV' },
    footerLogoUrl: { type: String, default: 'https://placehold.co/160x40/ffffff/a3a3a3?text=HNV' },
    faviconUrl: { type: String, default: '/favicon.svg' },
  },
  heroSection: { /* ... existing schema ... */ },
  featuresPage: { /* ... existing schema ... */ },
  // NEW: Services Section Schema
  servicesSection: {
      title: { type: String, default: 'Our Services' },
      subtitle: { type: String, default: 'Comprehensive solutions tailored for your property management needs.' },
      services: { type: [{ icon: String, title: String, text: String }], default: [
          { icon: 'users', title: 'Tenant Management', text: 'Efficiently track tenant information, lease agreements, and communication logs.' },
          { icon: 'home', title: 'Property Tracking', text: 'Manage property details, maintenance schedules, and unit availability.' },
          { icon: 'credit-card', title: 'Rent Collection', text: 'Automate rent reminders, process online payments, and track financial records.' }
      ]}
  },
  aboutPage: { /* ... existing schema ... */ },
  // NEW: Leadership Section Schema
  leadershipSection: {
      title: { type: String, default: 'Meet Our Leadership' },
      subtitle: { type: String, default: 'The driving force behind our commitment to excellence and innovation.'}
  },
  pricingSection: { /* ... existing schema ... */ },
  installAppSection: { /* ... existing schema ... */ },
  contactPage: { /* ... existing schema ... */ },
  footer: { /* ... existing schema ... */ },
  termsPageContent: { /* ... existing schema ... */ },
  privacyPolicyPageContent: { /* ... existing schema ... */ },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
