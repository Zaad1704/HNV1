export interface IFeature {
  title: string;
  description: string;
  text: string;
  icon: string;
  sectionId: string;
}

export interface IFeaturesPage {
  title: string;
  subtitle: string;
  features: IFeature[];
}

export interface ISiteSettings {
  logos?: {
    companyName?: string;
    faviconUrl?: string;
    footerLogoUrl?: string;
  };
  heroSection?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
  };
  footer?: {
    description?: string;
    copyrightText?: string;
    quickLinks?: Array<{
      text: string;
      url: string;
    }>;
  };
  contact?: {
    email?: string;
    phone?: string;
    addresses?: string[];
  };
  featuresPage?: IFeaturesPage;
}