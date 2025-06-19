// backend/models/SiteSettings.ts

import mongoose, { Schema, Document, model } from 'mongoose';

// --- Sub-document Interfaces ---
export interface ILink {
  text: string;
  url: string;
}

export interface IFeature {
    icon: string; // Suggest using an icon name (e.g., 'briefcase') or SVG content
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
  // Global settings
  logos: {
    navbarLogoUrl: string;
    footerLogoUrl: string;
    faviconUrl: string;
  };

  // Page-specific content
  heroSection: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImageUrl: string;
  };
  featuresPage: {
    title: string;
    subtitle: string;
    features: IFeature[];
  };
  aboutPage: {
    title: string;
    subtitle: string;
    missionStatement: string;
    visionStatement: string;
    imageUrl: string;
    teamTitle: string;
    teamSubtitle: string;
    executives: IExecutive[];
  };
  contactPage: {
    title: string;
    subtitle: string;
    formTitle: string;
    addresses: ICorporateAddress[];
  };

  // New Footer settings
  footer: {
    description: string;
    copyrightText: string;
    quickLinks: ILink[];
    contactLinks: ILink[];
    socialLinks: ILink[];
  };
  
  updatedBy: mongoose.Types.ObjectId;
}

// --- Mongoose Schema ---
const SiteSettingsSchema: Schema<ISiteSettings> = new Schema({
  logos: {
    navbarLogoUrl: { type: String, default: 'https://placehold.co/160x40/0f172a/f59e0b?text=HNV' },
    footerLogoUrl: { type: String, default: 'https://placehold.co/160x40/ffffff/a3a3a3?text=HNV' },
    faviconUrl: { type: String, default: '/favicon.svg' },
  },
  heroSection: {
    title: { type: String, default: 'The All-in-One Platform for Modern Property Management' },
    subtitle: { type: String, default: 'Automate tasks, track finances, and manage tenants with ease. HNV provides the tools you need to scale your property business efficiently.' },
    ctaText: { type: String, default: 'Start Your Free Trial' },
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop' },
  },
  featuresPage: {
    title: { type: String, default: 'Powerful Tools for Every Role' },
    subtitle: { type: String, default: 'From individual landlords to large agencies, our platform is designed to fit your needs.' },
    features: { type: [{
        icon: { type: String, default: 'briefcase' },
        title: { type: String, default: 'Feature Title' },
        text: { type: String, default: 'Detailed description of this powerful feature.' }
    }], default: [
        { icon: 'briefcase', title: 'Centralized Dashboard', text: 'View properties, tenants, and payments at a glance. Get a clear overview of your entire portfolio\'s performance.' },
        { icon: 'lock', title: 'Secure Document Storage', text: 'Upload and manage lease agreements, tenant IDs, and other important documents in one secure, accessible location.' },
        { icon: 'shield-check', title: 'Audit Trails & Security', text: 'Track every important action with a detailed audit log. Your data is secure with our multi-tenant architecture.' }
    ]}
  },
  aboutPage: {
    title: { type: String, default: 'About HNV Solutions' },
    subtitle: { type: String, default: 'We are dedicated to simplifying property management through innovative technology and customer-centric solutions.'},
    missionStatement: { type: String, default: 'To provide user-friendly tools that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability.' },
    visionStatement: { type: String, default: 'To be the leading global platform for property management, recognized for our commitment to customer success and continuous innovation.' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1992&auto=format&fit=crop' },
    teamTitle: { type: String, default: 'Meet Our Leadership' },
    teamSubtitle: { type: String, default: 'The driving force behind our commitment to excellence.' },
    executives: [{ name: { type: String }, title: { type: String }, imageUrl: { type: String } }]
  },
  contactPage: {
    title: { type: String, default: 'Get In Touch' },
    subtitle: { type: String, default: "We're here to help. Contact us for inquiries, support, or to learn more about our solutions." },
    formTitle: { type: String, default: 'Send Us a Message' },
    addresses: [{ locationName: { type: String }, fullAddress: { type: String }, phone: { type: String }, email: { type: String } }]
  },
  footer: {
    description: { type: String, default: 'HNV Solutions is the leading platform for streamlining property management tasks, from tenant communication to financial tracking.' },
    copyrightText: { type: String, default: 'HNV Property Management Solutions. All Rights Reserved.' },
    quickLinks: { type: [{ text: String, url: String }], default: [{text: 'About Us', url: '/about'}, {text: 'Services', url: '/features'}] },
    contactLinks: { type: [{ text: String, url: String }], default: [{text: 'Contact Support', url: '/contact'}] },
    socialLinks: { type: [{ text: String, url: String }], default: [{text: 'Facebook', url: '#'}, {text: 'Twitter', url: '#'}] },
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
