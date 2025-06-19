import mongoose, { Schema, Document, model } from 'mongoose';

export interface IContentSection {
  title: string;
  subtitle: string;
  ctaText?: string;
  backgroundImageUrl?: string;
}

// --- NEW: Sub-document schemas for arrays ---
export interface IExecutive {
  name: string;
  title: string;
  imageUrl: string;
}

export interface ICorporateAddress {
    locationName: string; // e.g., "Headquarters"
    fullAddress: string;  // e.g., "123 Property Lane, KL, Malaysia"
}


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
    card1Title: string;
    card1Text: string;
    card2Title: string;
    card2Text: string;
    card3Title: string;
    card3Text: string;
  };
  aboutSection: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    imageUrl: string;
    teamTitle: string; // NEW
    teamSubtitle: string; // NEW
    executives: IExecutive[]; // MODIFIED: now an array
  };
  ctaSection: {
    title: string;
    subtitle: string;
    buttonText: string;
    backgroundImageUrl: string;
  };
  contactSection: {
    title: string;
    subtitle: string;
    formTitle: string;
    addresses: ICorporateAddress[]; // MODIFIED: now an array
  };
  updatedBy: mongoose.Types.ObjectId;
}

const SiteSettingsSchema: Schema<ISiteSettings> = new Schema({
  // ... (theme and logos schemas remain the same)
  theme: {
    primaryColor: { type: String, default: '#4F46E5' },
    secondaryColor: { type: String, default: '#F59E0B' },
  },
  logos: {
    navbarLogoUrl: { type: String, default: 'https://via.placeholder.com/40/f59e0b/0f172a?text=HNV' },
    faviconUrl: { type: String, default: '/favicon.svg' },
  },
  heroSection: {
    title: { type: String, default: 'The All-in-One Platform for Modern Property Management' },
    subtitle: { type: String, default: 'Automate tasks, track finances, and manage tenants with ease.' },
    ctaText: { type: String, default: 'Start Your Free Trial' },
    backgroundImageUrl: { type: String, default: 'https://picsum.photos/id/1074/1920/1080' },
  },
  featuresSection: {
    title: { type: String, default: 'Powerful Tools for Every Role' },
    subtitle: { type: String, default: 'From individual landlords to large agencies, our platform is designed to fit your needs.' },
    card1Title: { type: String, default: 'Centralized Dashboard' },
    card1Text: { type: String, default: "View properties, tenants, and payments at a glance." },
    card2Title: { type: String, default: 'Secure Document Storage' },
    card2Text: { type: String, default: 'Upload and manage lease agreements and important documents.' },
    card3Title: { type: String, default: 'Audit Trails & Security' },
    card3Text: { type: String, default: 'Track every important action with a detailed audit log.' },
  },
  aboutSection: {
      title: { type: String, default: 'About HNV Solutions' },
      subtitle: { type: String, default: 'Simplifying property management through technology.'},
      missionTitle: { type: String, default: 'Our Mission' },
      missionText: { type: String, default: 'To provide user-friendly tools that empower property managers.' },
      visionTitle: { type: String, default: 'Our Vision' },
      visionText: { type: String, default: 'To be the leading global platform for property management.' },
      imageUrl: { type: String, default: 'https://picsum.photos/id/1043/600/400' },
      teamTitle: { type: String, default: 'Meet Our Leadership' },
      teamSubtitle: { type: String, default: 'The driving force behind our commitment to excellence.' },
      executives: [{ // MODIFIED
          name: { type: String },
          title: { type: String },
          imageUrl: { type: String }
      }]
  },
  ctaSection: {
      title: { type: String, default: 'Ready to Get Started?' },
      subtitle: { type: String, default: "Let's build the future of property management together." },
      buttonText: { type: String, default: 'Create Your Account' },
      backgroundImageUrl: { type: String, default: 'https://picsum.photos/id/12/1920/1080' },
  },
  contactSection: {
      title: { type: String, default: 'Get In Touch' },
      subtitle: { type: String, default: "We're here to help." },
      formTitle: { type: String, default: 'Send Us a Message' },
      addresses: [{ // MODIFIED
          locationName: { type: String },
          fullAddress: { type: String }
      }]
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
