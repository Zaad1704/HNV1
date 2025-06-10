import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

// --- Production-Ready i18n Service ---
// This file centralizes the internationalization setup for the ENTIRE application.

// TODO for Developer: For a large-scale app, move the translation objects below 
// into separate JSON files within the `frontend/public/locales/` directory.
// For example: /public/locales/en/translation.json
// The i18next-http-backend is already configured to load them automatically.

const translationsEn = {
  // --- Header & Global ---
  header: {
    features: "Features",
    about: "About Us",
    pricing: "Pricing",
    contact: "Contact",
    login: "Portal Log In",
    getStarted: "Get Started"
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
      title: "About HNV Properties",
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
      landlordPlan: "Landlord Plan",
      landlordDesc: "Perfect for property owners managing their own portfolio.",
      agentPlan: "Agent Plan",
      agentDesc: "For professional agents managing properties for multiple owners.",
      perMonth: "/ month",
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
  // --- App Dashboard Pages ---
  dashboard: {
    overview: "Overview",
    properties: "Properties",
    tenants: "Tenants",
    payments: "Payments",
    auditLog: "Audit Log",
    settings: "Settings",
    siteContent: "Site Content"
  }
};

const translationsBn = {
  header: {
    features: "বৈশিষ্ট্য",
    about: "আমাদের সম্পর্কে",
    pricing: "মূল্য নির্ধারণ",
    contact: "যোগাযোগ",
    login: "পোর্টাল লগইন",
    getStarted: "শুরু করুন"
  },
  hero: {
    title: "আধুনিক সম্পত্তি ব্যবস্থাপনার জন্য অল-ইন-ওয়ান প্ল্যাটফর্ম",
    subtitle: "স্বয়ংক্রিয়ভাবে কাজ করুন, অর্থ ট্র্যাক করুন এবং ভাড়াটেদের সহজে পরিচালনা করুন। HNV আপনার সম্পত্তি ব্যবসা দক্ষতার সাথে বাড়ানোর জন্য প্রয়োজনীয় সরঞ্জাম সরবরাহ করে।",
    cta: "আপনার বিনামূল্যে ট্রায়াল শুরু করুন"
  },
  features: {
      title: "প্রতিটি ভূমিকার জন্য শক্তিশালী সরঞ্জাম",
      subtitle: "স্বতন্ত্র বাড়িওয়ালা থেকে শুরু করে বড় সংস্থা পর্যন্ত, আমাদের প্ল্যাটফর্মটি আপনার প্রয়োজন অনুসারে ডিজাইন করা হয়েছে।",
      card1Title: "কেন্দ্রীয় ড্যাশবোর্ড",
      card1Text: "এক নজরে সম্পত্তি, ভাড়াটে এবং অর্থপ্রদান দেখুন। আপনার সম্পূর্ণ পোর্টফোলিওর পারফরম্যান্সের একটি পরিষ্কার ওভারভিউ পান।",
      card2Title: "সুরক্ষিত ডকুমেন্ট স্টোরেজ",
      card2Text: "একটি সুরক্ষিত, অ্যাক্সেসযোগ্য স্থানে ইজারা চুক্তি, ভাড়াটে আইডি এবং অন্যান্য গুরুত্বপূর্ণ নথি আপলোড এবং পরিচালনা করুন।",
      card3Title: "অডিট ট্রেল এবং সুরক্ষা",
      card3Text: "একটি বিশদ অডিট লগের মাধ্যমে প্রতিটি গুরুত্বপূর্ণ পদক্ষেপ ট্র্যাক করুন। আপনার ডেটা আমাদের মাল্টি-টেন্যান্ট আর্কিটেকচারের সাথে সুরক্ষিত।",
  },
  about: {
      title: "HNV প্রপার্টিজ সম্পর্কে",
      subtitle: "আমরা উদ্ভাবনী প্রযুক্তি এবং গ্রাহক-কেন্দ্রিক সমাধানের মাধ্যমে সম্পত্তি ব্যবস্থাপনাকে সহজ করার জন্য নিবেদিত।",
      missionTitle: "আমাদের লক্ষ্য",
      missionText: "ব্যবহারকারী-বান্ধব সরঞ্জাম সরবরাহ করা যা সম্পত্তি পরিচালকদের পরিচালন শ্রেষ্ঠত্ব অর্জন করতে, ভাড়াটেদের সন্তুষ্টি বাড়াতে এবং লাভজনকতা সর্বাধিক করতে সক্ষম করে।",
      visionTitle: "আমাদের দৃষ্টি",
      visionText: "সম্পত্তি ব্যবস্থাপনার জন্য শীর্ষস্থানীয় বিশ্বব্যাপী প্ল্যাটফর্ম হওয়া, গ্রাহকের সাফল্য এবং ক্রমাগত উদ্ভাবনের প্রতি আমাদের প্রতিশ্রুতির জন্য স্বীকৃত।",
      teamTitle: "আমাদের নেতৃত্বের সাথে পরিচিত হন",
      teamSubtitle: "শ্রেষ্ঠত্বের প্রতি আমাদের প্রতিশ্রুতির চালিকা শক্তি।"
  },
  pricing: {
      title: "আপনার প্ল্যান বেছে নিন",
      subtitle: "আপনাকে বাড়াতে সাহায্য করার জন্য সহজ, স্বচ্ছ মূল্য। কোন লুকানো ফি নেই।",
      landlordPlan: "বাড়িওয়ালা প্ল্যান",
      landlordDesc: "সম্পত্তির মালিকদের জন্য উপযুক্ত যারা তাদের নিজস্ব পোর্টফোলিও পরিচালনা করেন।",
      agentPlan: "এজেন্ট প্ল্যান",
      agentDesc: "একাধিক মালিকদের জন্য সম্পত্তি পরিচালনাকারী পেশাদার এজেন্টদের জন্য।",
      perMonth: "/ মাস",
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
  cta: {
      title: "শুরু করতে প্রস্তুত?",
      subtitle: "আসুন একসাথে সম্পত্তি ব্যবস্থাপনার ভবিষ্যত গড়ি।",
      button: "আপনার অ্যাকাউন্ট তৈরি করুন"
  },
  contact: {
      title: "যোগাযোগ করুন",
      subtitle: "আমরা সাহায্য করতে এখানে আছি। অনুসন্ধান, সমর্থন বা আমাদের সমাধান সম্পর্কে আরও জানতে আমাদের সাথে যোগাযোগ করুন।",
      officeTitle: "আমাদের অফিস",
      phoneTitle: "ফোন সমর্থন",
      emailTitle: "আমাদের ইমেইল করুন",
      formTitle: "আমাদের একটি বার্তা পাঠান",
      nameLabel: "পুরো নাম",
      emailLabel: "ইমেইল ঠিকানা",
      subjectLabel: "বিষয়",
      messageLabel: "বার্তা",
      submitButton: "বার্তা পাঠান"
  },
  dashboard: {
    overview: "সংক্ষিপ্ত বিবরণ",
    properties: "সম্পত্তি",
    tenants: "ভাড়াটে",
    payments: "পেমেন্ট",
    auditLog: "অডিট লগ",
    settings: "সেটিংস",
    siteContent: "সাইটের বিষয়বস্তু"
  }
};

// Example for a third language
const translationsEs = {
    header: {
        features: "Características",
        about: "Sobre Nosotros",
        pricing: "Precios",
        contact: "Contacto",
        login: "Iniciar Sesión",
        getStarted: "Empezar"
    },
    hero: {
        title: "La Plataforma Todo en Uno para la Gestión Moderna de Propiedades",
        subtitle: "Automatice tareas, controle las finanzas y gestione inquilinos con facilidad. HNV proporciona las herramientas que necesita para escalar su negocio inmobiliario de manera eficiente.",
        cta: "Comience su Prueba Gratuita"
    },
    // ... other Spanish translations would go here
};


i18n
  // Use HttpApi backend to load translations from /public/locales
  // This is the production-ready way to handle translations.
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    // For this demonstration, we are still defining resources directly.
    // In a real build, you would remove this 'resources' block.
    resources: {
      en: { translation: translationsEn },
      bn: { translation: translationsBn },
      es: { translation: translationsEs }
    },
    lng: "en", // default language
    fallbackLng: "en", // use English if the detected language is not available
    interpolation: { escapeValue: false },
    debug: true, // Set to false in production

    // Configuration for i18next-http-backend
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
  });

export default i18n;
