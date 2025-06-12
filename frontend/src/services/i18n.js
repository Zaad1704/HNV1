import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

// This file centralizes all the translation text and configuration.
// For a large-scale app, a developer would move these translation objects 
// into separate JSON files within the `frontend/public/locales/` directory.
// The i18next-http-backend is already configured to load them automatically.

const translationsEn = {
  // --- Global ---
  header: {
    features: "Features",
    about: "About Us",
    pricing: "Pricing",
    contact: "Contact",
    login: "Portal Log In",
    getStarted: "Get Started",
    installApp: "Install App"
  },
  // --- Landing Page ---
  hero: {
    title: "The All-in-One Platform for Modern Property Management",
    subtitle: "Automate tasks, track finances, and manage tenants with ease. HNV provides the tools you need to scale your property business efficiently.",
    cta: "Start Your Free Trial"
  },
  features: {
      title: "Powerful Tools for Every Role",
      subtitle: "From individual landlords to large agencies, our platform is designed to fit your needs.",
      card1Title: "Centralized Dashboard",
      card1Text: "View properties, tenants, and payments at a glance. Get a clear overview of your entire portfolio's performance.",
      card2Title: "Secure Document Storage",
      card2Text: "Upload and manage lease agreements, tenant IDs, and other important documents in one secure, accessible location.",
      card3Title: "Audit Trails & Security",
      card3Text: "Track every important action with a detailed audit log. Your data is secure with our multi-tenant architecture."
  },
  about: {
      title: "About HNV Property Management Solutions",
      subtitle: "We are dedicated to simplifying property management through innovative technology and customer-centric solutions.",
      missionTitle: "Our Mission",
      missionText: "To provide user-friendly tools that empower property managers to achieve operational excellence, enhance tenant satisfaction, and maximize profitability.",
      visionTitle: "Our Vision",
      visionText: "To be the leading global platform for property management, recognized for our commitment to customer success and continuous innovation.",
      teamTitle: "Meet Our Leadership",
      teamSubtitle: "The driving force behind our commitment to excellence."
  },
  pricing: {
      title: "Choose Your Plan",
      subtitle: "Simple, transparent pricing to help you grow. No hidden fees.",
      trialPlan: "Free Trial",
      trialDesc: "Explore basic features and get a feel for the platform.",
      landlordPlan: "Landlord Plan",
      landlordDesc: "Perfect for property owners managing their own portfolio.",
      agentPlan: "Agent Plan",
      agentDesc: "For professional agents managing properties for multiple owners.",
      perMonth: "/ month",
      featureTrial1: "1 User",
      featureTrial2: "5 Properties",
      featureTrial3: "10 Tenants",
      feature1: "Manage up to 20 Tenants",
      feature2: "Invite 1 Agent User",
      feature3: "Full Property & Payment Tracking",
      feature4: "Basic Reporting",
      feature5: "Manage up to 50 Tenants",
      feature6: "Invite Unlimited Landlords",
      feature7: "Advanced Reporting & Analytics",
      feature8: "Priority Support",
      cta: "Choose Plan",
      disclaimer: "Subscription and billing are managed securely through our payment partner, 2Checkout."
  },
  cta: {
      title: "Ready to Get Started?",
      subtitle: "Let's build the future of property management together.",
      button: "Create Your Account"
  },
  contact: {
      title: "Get In Touch",
      subtitle: "We're here to help. Contact us for inquiries, support, or to learn more about our solutions.",
      officeTitle: "Our Office",
      phoneTitle: "Phone Support",
      emailTitle: "Email Us",
      formTitle: "Send Us a Message",
      nameLabel: "Full Name",
      emailLabel: "Email Address",
      subjectLabel: "Subject",
      messageLabel: "Message",
      submitButton: "Send Message"
  },
  // --- Authenticated App Pages ---
  dashboard: {
    overview: "Overview",
    properties: "Properties",
    tenants: "Tenants",
    billing: "Billing",
    auditLog: "Audit Log",
    settings: "Settings"
  },
  adminDashboard: {
      title: "Super Admin Dashboard",
      manageUsers: "Manage Users",
      manageOrgs: "Manage Organizations",
      viewBilling: "View Billing",
      editContent: "Edit Website Content"
  }
};

const translationsBn = {
  header: {
    features: "বৈশিষ্ট্য",
    about: "আমাদের সম্পর্কে",
    pricing: "মূল্য নির্ধারণ",
    contact: "যোগাযোগ",
    login: "পোর্টাল লগইন",
    getStarted: "শুরু করুন",
    installApp: "অ্যাপ ইনস্টল করুন"
  },
  // ... all other Bengali translations
  pricing: {
      title: "আপনার প্ল্যান বেছে নিন",
      subtitle: "আপনাকে বাড়াতে সাহায্য করার জন্য সহজ, স্বচ্ছ মূল্য। কোন লুকানো ফি নেই।",
      trialPlan: "ফ্রি ট্রায়াল",
      trialDesc: "বেসিক বৈশিষ্ট্যগুলি অন্বেষণ করুন এবং প্ল্যাটফর্মের একটি অনুভূতি পান।",
      landlordPlan: "বাড়িওয়ালা প্ল্যান",
      landlordDesc: "সম্পত্তির মালিকদের জন্য উপযুক্ত যারা তাদের নিজস্ব পোর্টফোলিও পরিচালনা করেন।",
      agentPlan: "এজেন্ট প্ল্যান",
      agentDesc: "একাধিক মালিকদের জন্য সম্পত্তি পরিচালনাকারী পেশাদার এজেন্টদের জন্য।",
      perMonth: "/ মাস",
      featureTrial1: "১ জন ব্যবহারকারী",
      featureTrial2: "৫টি সম্পত্তি",
      featureTrial3: "১০ জন ভাড়াটে",
      feature1: "২০ জন পর্যন্ত ভাড়াটে পরিচালনা করুন",
      feature2: "১ জন এজেন্ট ব্যবহারকারীকে আমন্ত্রণ জানান",
      feature3: "সম্পূর্ণ সম্পত্তি এবং পেমেন্ট ট্র্যাকিং",
      feature4: "বেসিক রিপোর্টিং",
      feature5: "৫০ জন পর্যন্ত ভাড়াটে পরিচালনা করুন",
      feature6: "সীমাহীন বাড়িওয়ালাদের আমন্ত্রণ জানান",
      feature7: "উন্নত রিপোর্টিং এবং বিশ্লেষণ",
      feature8: "অগ্রাধিকার সমর্থন",
      cta: "প্ল্যান বেছে নিন",
      disclaimer: "সাবস্ক্রিপশন এবং বিলিং আমাদের পেমেন্ট পার্টনার, 2Checkout এর মাধ্যমে সুরক্ষিতভাবে পরিচালিত হয়।"
  },
};

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationsEn },
      bn: { translation: translationsBn },
      // A developer would add more languages here, e.g., 'es'
    },
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    debug: true, // Set to false in production
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;
