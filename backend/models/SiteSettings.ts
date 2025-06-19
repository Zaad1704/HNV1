// backend/models/SiteSettings.ts

import mongoose, { Schema, Document, model } from 'mongoose';

// Interface definitions remain the same...
export interface IContentSection {
  title: string;
  subtitle: string;
  ctaText?: string;
  backgroundImageUrl?: string;
}

export interface IExecutive {
  name: string;
  title:string;
  imageUrl: string;
}

export interface ICorporateAddress {
    locationName: string;
    fullAddress: string;
}

// Added Pricing Section to the main interface
export interface ISiteSettings extends Document {
  theme: { primaryColor: string; secondaryColor: string; };
  logos: { navbarLogoUrl: string; faviconUrl: string; };
  heroSection: IContentSection;
  featuresSection: { title: string; subtitle: string; card1Title: string; card1Text: string; card2Title: string; card2Text: string; card3Title: string; card3Text: string; };
  pricingSection: { title: string; subtitle: string; }; // NEW
  aboutSection: { title: string; subtitle: string; missionTitle: string; missionText: string; visionTitle: string; visionText: string; imageUrl: string; teamTitle: string; teamSubtitle: string; executives: IExecutive[]; };
  ctaSection: { title: string; subtitle: string; buttonText: string; backgroundImageUrl: string; };
  contactSection: { title: string; subtitle: string; formTitle: string; addresses: ICorporateAddress[]; };
  updatedBy: mongoose.Types.ObjectId;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema({
  theme: {
    primaryColor: { type: String, default: '#4338ca' }, // Indigo-700
    secondaryColor: { type: String, default: '#f59e0b' }, // Amber-500
  },
  logos: {
    navbarLogoUrl: { type: String, default: 'https://placehold.co/40x40/f59e0b/0f172a?text=HNV' },
    faviconUrl: { type: String, default: '/favicon.svg' },
  },
  heroSection: {
    title: { type: String, default: 'The All-in-One Platform for Modern Property Management' },
    subtitle: { type: String, default: 'Automate tasks, track finances, and manage tenants with ease. HNV provides the tools you need to scale your property business efficiently.' },
    ctaText: { type: String, default: 'Start Your Free Trial' },
    backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop' },
  },
  featuresSection: {
    title: { type: String, default: 'Powerful Tools for Every Role' },
    subtitle: { type: String, default: 'From individual landlords to large agencies, our platform is designed to fit your needs.' },
    card1Title: { type: String, default: 'Centralized Dashboard' },
    card1Text: { type: String, default: "View properties, tenants, and payments at a glance. Get a clear overview of your entire portfolio's performance." },
    card2Title: { type: String, default: 'Secure Document Storage' },
    card2Text: { type: String, default: 'Upload and manage lease agreements, tenant IDs, and other important documents in one secure, accessible location.' },
    card3Title: { type: String, default: 'Audit Trails & Security' },
    card3Text: { type: String, default: 'Track every important action with a detailed audit log. Your data is secure with our multi-tenant architecture.' },
  },
  // NEW SECTION ADDED
  pricingSection: {
      title: { type: String, default: 'Choose The Plan That\'s Right For You' },
      subtitle: { type: String, default: 'Simple, transparent pricing to help you grow. No hidden fees, cancel anytime.'}
  },
  aboutSection: {
      title: { type: String, default: 'About HNV Solutions' },
      subtitle: { type: String, default: 'We are dedicated to simplifying property management through innovative technology and customer-centric solutions.'},
      missionTitle: { type: String, default: 'Our Mission' },
      missionText: { type: String, default: 'To provide user-friendly tools that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability.' },
      visionTitle: { type: String, default: 'Our Vision' },
      visionText: { type: String, default: 'To be the leading global platform for property management, recognized for our commitment to customer success and continuous innovation.' },
      imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=1992&auto=format&fit=crop' },
      teamTitle: { type: String, default: 'Meet Our Leadership' },
      teamSubtitle: { type: String, default: 'The driving force behind our commitment to excellence.' },
      executives: [{ name: { type: String }, title: { type: String }, imageUrl: { type: String } }]
  },
  ctaSection: {
      title: { type: String, default: 'Ready to Streamline Your Management?' },
      subtitle: { type: String, default: "Join hundreds of landlords and agents who trust HNV to manage their properties. Let's build the future of property management together." },
      buttonText: { type: String, default: 'Create Your Account Today' },
      backgroundImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1600585152225-358bfe9ddb0b?q=80&w=2070&auto=format&fit=crop' },
  },
  contactSection: {
      title: { type: String, default: 'Get In Touch' },
      subtitle: { type: String, default: "We're here to help. Contact us for inquiries, support, or to learn more about our solutions." },
      formTitle: { type: String, default: 'Send Us a Message' },
      addresses: [{ locationName: { type: String }, fullAddress: { type: String } }]
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
