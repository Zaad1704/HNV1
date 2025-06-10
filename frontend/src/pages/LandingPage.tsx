import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- i18n Configuration ---
// In a real app, this would be in a separate i18n.js file.
const translationsEn = {
  header: {
    features: "Features",
    about: "About Us",
    pricing: "Pricing",
    contact: "Contact",
    login: "Portal Log In",
    getStarted: "Get Started"
  },
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
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationsEn },
      bn: { translation: translationsBn }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

// --- Component ---
const LandingPageContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
  
  // Simulate IP-based geolocation on initial load
  useEffect(() => {
    const fetchLocation = async () => {
      // In a real app, you would use a service like geo.ipify.org
      // For demonstration, we'll simulate it.
      const simulatedLocation = 'BD'; // Change to 'US' or other to test
      
      if (simulatedLocation === 'BD') {
        i18n.changeLanguage('bn');
        setCurrency({ code: 'BDT', symbol: '৳', rate: 117 }); // Simulated exchange rate
      } else {
        i18n.changeLanguage('en');
        setCurrency({ code: 'USD', symbol: '$', rate: 1 });
      }
    };
    fetchLocation();
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Adjust currency based on language choice for this demo
    if (lng === 'bn') {
      setCurrency({ code: 'BDT', symbol: '৳', rate: 117 });
    } else {
      setCurrency({ code: 'USD', symbol: '$', rate: 1 });
    }
  };
  
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://placehold.co/150x150/7C3AED/FFFFFF?text=CEO" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://placehold.co/150x150/EC4899/FFFFFF?text=CTO" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://placehold.co/150x150/10B981/FFFFFF?text=COO" }
  ];

  // This style tag will manage the background images for each section.
  // The Super Admin could eventually change these URLs from the dashboard.
  const sectionBackgrounds = `
    .hero-section { background-image: url('https://placehold.co/1920x1080/1e293b/ffffff?text=Cityscape'); }
    .features-section { background-image: url('https://placehold.co/1920x1080/0f172a/ffffff?text=Modern+Office'); }
    .about-section { background-image: url('https://placehold.co/1920x1080/1e293b/ffffff?text=Architecture'); }
    .pricing-section { background-image: url('https://placehold.co/1920x1080/0f172a/ffffff?text=Financial+District'); }
    .cta-section { background-image: url('https://placehold.co/1920x1080/1e293b/ffffff?text=Apartment+Keys'); }
    .contact-section { background-image: url('https://placehold.co/1920x1080/0f172a/ffffff?text=City+at+Night'); }
  `;

  return (
    <>
      <style>{sectionBackgrounds}</style>
      <div className="bg-slate-900 text-slate-200">
        <header className="bg-slate-900/70 backdrop-blur-md shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src="https://placehold.co/40x40/818cf8/1e293b?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold text-white">HNV Properties</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-white font-medium transition-colors">{t('header.features')}</button>
              <button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-white font-medium transition-colors">{t('header.about')}</button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-white font-medium transition-colors">{t('header.pricing')}</button>
              <button onClick={() => scrollToSection('contact')} className="text-slate-300 hover:text-white font-medium transition-colors">{t('header.contact')}</button>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                  <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'en' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>EN</button>
                  <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'bn' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>BN</button>
              </div>
              <Link to="/login" className="text-slate-300 font-semibold hover:text-white transition-colors">{t('header.login')}</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all">
                {t('header.getStarted')}
              </Link>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden px-6 pt-2 pb-4 space-y-2">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.features')}</button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.about')}</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.pricing')}</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.contact')}</button>
              <hr className="my-2 border-slate-700" />
              <Link to="/login" className="block py-2 text-slate-300 font-semibold hover:text-white">{t('header.login')}</Link>
              <Link to="/register" className="block w-full mt-2 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg">{t('header.getStarted')}</Link>
            </div>
          )}
        </header>

        <main>
          <section className="hero-section relative bg-cover bg-center text-white py-32 sm:py-48">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent"></div>
            <div className="container mx-auto px-6 text-center sm:text-left relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">{t('hero.title')}</h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto sm:mx-0 mb-10">{t('hero.subtitle')}</p>
                <Link to="/register" className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg text-lg hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105">
                    {t('hero.cta')}
                </Link>
            </div>
          </section>

          <section id="features" className="features-section relative bg-cover bg-center py-20 text-white">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">{t('features.title')}</h2>
                <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('features.subtitle')}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-indigo-500 transition-all duration-300">
                  <h3 className="text-xl font-bold text-indigo-400 mb-3">{t('features.card1Title')}</h3>
                  <p className="text-slate-300">{t('features.card1Text')}</p>
                </div>
                <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-indigo-500 transition-all duration-300">
                  <h3 className="text-xl font-bold text-indigo-400 mb-3">{t('features.card2Title')}</h3>
                  <p className="text-slate-300">{t('features.card2Text')}</p>
                </div>
                <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-indigo-500 transition-all duration-300">
                  <h3 className="text-xl font-bold text-indigo-400 mb-3">{t('features.card3Title')}</h3>
                  <p className="text-slate-300">{t('features.card3Text')}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="about" className="about-section relative bg-cover bg-center py-20 text-white">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            <div className="container mx-auto px-6 relative z-10">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">{t('about.title')}</h2>
                    <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-2xl font-bold text-indigo-400 mb-4">{t('about.missionTitle')}</h3>
                        <p className="mb-8 text-slate-300 leading-relaxed">{t('about.missionText')}</p>
                        <h3 className="text-2xl font-bold text-indigo-400 mb-4">{t('about.visionTitle')}</h3>
                        <p className="text-slate-300 leading-relaxed">{t('about.visionText')}</p>
                    </div>
                     <div className="rounded-2xl overflow-hidden shadow-xl">
                        <img src="https://placehold.co/600x400/312e81/ffffff?text=Our+Vision" alt="Team Vision" className="w-full h-auto object-cover"/>
                    </div>
                </div>
                 <div className="text-center mt-20">
                    <h2 className="text-3xl font-bold">{t('about.teamTitle')}</h2>
                    <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.teamSubtitle')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">
                    {executives.map((exec, index) => (
                        <div key={index} className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-105 border border-slate-700">
                            <img src={exec.img} alt={exec.name} className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-indigo-500" />
                            <h3 className="text-xl font-semibold text-white">{exec.name}</h3>
                            <p className="text-indigo-400 font-medium">{exec.title}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          <section id="pricing" className="pricing-section relative bg-cover bg-center py-20 text-white">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">{t('pricing.title')}</h2>
                    <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-10 max-w-4xl mx-auto items-stretch">
                    <div className="bg-slate-800/50 backdrop-blur-md border-2 border-indigo-500 rounded-2xl p-8 shadow-2xl flex flex-col hover:scale-105 hover:border-indigo-400 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-indigo-400">{t('pricing.landlordPlan')}</h3>
                        <p className="text-slate-400 mt-2">{t('pricing.landlordDesc')}</p>
                        <div className="mt-6">
                            <span className="text-5xl font-extrabold text-white">{currency.symbol}{Math.round(10 * currency.rate)}</span>
                            <span className="text-slate-400"> {t('pricing.perMonth')}</span>
                        </div>
                        <ul className="space-y-4 mt-8 text-slate-300 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature1')}</li>
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature2')}</li>
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature3')}</li>
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature4')}</li>
                        </ul>
                        <Link to="/register" className="w-full text-center mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-indigo-500/50 transition-all">{t('pricing.cta')}</Link>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-lg flex flex-col hover:scale-105 hover:border-slate-500 transition-all duration-300">
                        <h3 className="text-2xl font-bold text-white">{t('pricing.agentPlan')}</h3>
                        <p className="text-slate-400 mt-2">{t('pricing.agentDesc')}</p>
                        <div className="mt-6">
                           <span className="text-5xl font-extrabold text-white">{currency.symbol}{Math.round(25 * currency.rate)}</span>
                            <span className="text-slate-400"> {t('pricing.perMonth')}</span>
                        </div>
                        <ul className="space-y-4 mt-8 text-slate-300 flex-grow">
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature5')}</li>
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature6')}</li>
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature7')}</li>
                            <li className="flex items-center"><span className="text-green-400 mr-3">✔</span>{t('pricing.feature8')}</li>
                        </ul>
                         <Link to="/register" className="w-full text-center mt-10 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">{t('pricing.cta')}</Link>
                    </div>
                </div>
                 <p className="text-center text-xs text-slate-500 mt-4">{t('pricing.disclaimer')}</p>
            </div>
          </section>

          <section className="cta-section relative bg-cover bg-center py-20">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
            <div className="container mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl font-bold text-white">{t('cta.title')}</h2>
                <p className="mt-4 mb-8 text-slate-300 max-w-xl mx-auto">{t('cta.subtitle')}</p>
                <Link to="/register" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/50">
                    {t('cta.button')}
                </Link>
            </div>
          </section>
        </main>

       <footer id="contact" className="contact-section relative bg-cover bg-center text-gray-300 py-16">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>
            <div className="container mx-auto px-6 relative z-10">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white">{t('contact.title')}</h2>
                    <p className="text-indigo-300 mt-4 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div className="space-y-8">
                         <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{t('contact.officeTitle')}</h3>
                            <p className="text-slate-400">123 Property Lane, Suite 400<br/>Management City, MC 54321</p>
                        </div>
                         <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{t('contact.phoneTitle')}</h3>
                            <p className="text-slate-400">General: (555) 123-4567<br/>Support: (555) 765-4321</p>
                        </div>
                         <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{t('contact.emailTitle')}</h3>
                            <p className="text-slate-400">info@hnvproperties.com<br/>support@hnvproperties.com</p>
                        </div>
                    </div>
                    <div>
                        <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-semibold text-white mb-4">{t('contact.formTitle')}</h3>
                            <form className="space-y-4">
                                <input type="text" placeholder={t('contact.nameLabel')} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <input type="email" placeholder={t('contact.emailLabel')} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <input type="text" placeholder={t('contact.subjectLabel')} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                                <textarea placeholder={t('contact.messageLabel')} rows="4" className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
                                <button type="submit" className="w-full py-3 bg-indigo-600 font-semibold rounded-lg hover:bg-indigo-500">{t('contact.submitButton')}</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
    </>
  );
};

// Wrapper component to provide the i18n instance
const AppWrapper = () => (
  <I18nextProvider i18n={i18n}>
    <LandingPageContent />
  </I18nextProvider>
);

export default AppWrapper;
