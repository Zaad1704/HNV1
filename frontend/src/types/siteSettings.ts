// This file safely duplicates the type definitions for the frontend,
// removing the invalid dependency on the backend folder.

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
  bio?: string;
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

export interface IService {
    icon: string;
    title: string;
    text: string;
}

export interface ISiteSettings {
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
}
