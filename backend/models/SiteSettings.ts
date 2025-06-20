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

// NEW: Interface for Legal Pages Content
export interface ILegalContent {
  title: string;
  lastUpdated: string;
  content: string; // HTML or Markdown content for the policy
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
    legalLinks: ILink[]; // This already exists
    socialLinks: ILink[];
  };
  // NEW: Add fields for Terms and Privacy Policy content
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
  heroSection: {
    title: { type: String, default: 'The All-in-One Platform for Modern Property Management' },
    subtitle: { type: String, default: 'Automate tasks, track finances, and manage tenants with ease.' },
    ctaText: { type: String, default: 'Start Your Free Trial' },
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop' },
  },
  featuresPage: {
    title: { type: String, default: 'Powerful Tools for Every Role' },
    subtitle: { type: String, default: 'From individual landlords to large agencies, our platform is designed to fit your needs.' },
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.co/1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop' },
    features: { type: [{ icon: String, title: String, text: String }], default: [
        { icon: 'briefcase', title: 'Centralized Dashboard', text: 'View properties, tenants, and payments at a glance.' },
        { icon: 'lock', title: 'Secure Document Storage', text: 'Upload and manage lease agreements and important documents.' },
        { icon: 'shield-check', title: 'Audit Trails & Security', text: 'Track every important action with a detailed audit log.' }
    ]}
  },
  aboutPage: {
    title: { type: String, default: 'About HNV Solutions' },
    subtitle: { type: String, default: 'We are dedicated to simplifying property management through innovative technology.'},
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop' },
    missionTitle: { type: String, default: 'Our Mission' },
    missionStatement: { type: String, default: 'To provide user-friendly tools that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability.' },
    visionTitle: { type: String, default: 'Our Vision' },
    visionStatement: { type: String, default: 'To be the leading global platform for property management, recognized for our commitment to customer success and continuous innovation.' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1992&auto=format&fit=crop' },
    teamTitle: { type: String, default: 'Meet Our Leadership' },
    teamSubtitle: { type: String, default: 'The driving force behind our commitment to excellence.' },
    executives: [{ name: String, title: String, imageUrl: String }]
  },
  pricingSection: {
      title: { type: String, default: 'Choose The Plan That\'s Right For You' },
      subtitle: { type: String, default: 'Simple, transparent pricing to help you grow. No hidden fees, cancel anytime.'},
      backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1554469384-e58fac166824?q=80&w=1974&auto=format&fit=crop' },
      disclaimer: { type: String, default: 'Subscription and billing are managed securely through our payment partner.'}
  },
  installAppSection: {
    title: { type: String, default: 'Get the Full App Experience' },
    subtitle: { type: String, default: 'Install the HNV web app on your device for faster access and a native-like feel, available on all platforms.' },
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1618042164217-66a8ea535560?q=80&w=1974&auto=format&fit=crop' }
  },
  contactPage: {
    title: { type: String, default: 'Get In Touch' },
    subtitle: { type: String, default: "We're here to help. Contact us for inquiries, support, or to learn more about our solutions." },
    formTitle: { type: String, default: 'Send Us a Message' },
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop' },
    addresses: [{ locationName: String, fullAddress: String, phone: String, email: String }]
  },
  footer: {
    description: { type: String, default: 'HNV Solutions is the leading platform for streamlining property management tasks, from tenant communication to financial tracking.' },
    copyrightText: { type: String, default: 'HNV Property Management Solutions. All Rights Reserved.' },
    quickLinks: { type: [{ text: String, url: String }], default: [
        {text: 'About Us', url: '#about'},
        {text: 'Features', url: '#features'},
        {text: 'Pricing', url: '#pricing'}
    ] },
    legalLinks: { type: [{ text: String, url: String }], default: [
        {text: 'Privacy Policy', url: '/privacy'},
        {text: 'Terms & Conditions', url: '/terms'}
    ] },
    socialLinks: { type: [{ text: String, url: String }], default: [
        {text: 'Facebook', url: '#'},
        {text: 'Twitter', url: '#'},
        {text: 'LinkedIn', url: '#'}
    ] },
  },
  // NEW SCHEMA FIELDS FOR LEGAL CONTENT
  termsPageContent: {
    title: { type: String, default: 'Terms and Conditions' },
    lastUpdated: { type: String, default: 'June 21, 2025' },
    content: { type: String, default: '<h1>Terms and Conditions</h1><p>Welcome to HNV Property Management Solutions...</p>' },
  },
  privacyPolicyPageContent: {
    title: { type: String, default: 'Privacy Policy' },
    lastUpdated: { type: String, default: 'June 21, 2025' },
    content: { type: String, default: '<h1>Privacy Policy</h1><p>HNV Property Management Solutions is committed to protecting your privacy...</p>' },
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
