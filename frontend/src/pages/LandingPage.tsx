import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';

const LandingPageContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- PWA Installation Logic ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };
  
  // --- Language & Currency Logic ---
  useEffect(() => {
    const fetchUserLocale = async () => {
        const simulatedCountry = 'US'; // Test with 'BD', 'ES', etc.
        let lang = 'en', curr = { code: 'USD', symbol: '$', rate: 1 };
        let localLanguageName = 'English';

        if (simulatedCountry === 'BD') {
            lang = 'bn';
            curr = { code: 'BDT', symbol: '৳', rate: 117 };
            localLanguageName = 'বাংলা';
        } else if (simulatedCountry === 'ES') {
            lang = 'es';
            curr = { code: 'EUR', symbol: '€', rate: 0.92 };
            localLanguageName = 'Español';
        }
        
        i18n.changeLanguage('en');
        setCurrency({ code: 'USD', symbol: '$', rate: 1 });

        if (lang !== 'en') {
            setTimeout(() => {
                if (window.confirm(`Want to see this page in ${localLanguageName}?`)) {
                    i18n.changeLanguage(lang);
                    setCurrency(curr);
                }
            }, 1000);
        }
    };
    fetchUserLocale();
  }, [i18n]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (lng === 'bn') setCurrency({ code: 'BDT', symbol: '৳', rate: 117 });
    else if (lng === 'es') setCurrency({ code: 'EUR', symbol: '€', rate: 0.92 });
    else setCurrency({ code: 'USD', symbol: '$', rate: 1 });
  };
  
  const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://picsum.photos/id/1005/150/150" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://picsum.photos/id/1011/150/150" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://picsum.photos/id/1027/150/150" }
  ];

  const pricingPlans = [
    { name: 'trialPlan', price: 0, features: ['featureTrial1', 'featureTrial2', 'featureTrial3'], recommended: false, ctaColor: 'bg-slate-700 hover:bg-slate-600' },
    { name: 'landlordPlan', price: 10, features: ['feature1', 'feature2', 'feature3', 'feature4'], recommended: true, ctaColor: 'bg-pink-600 hover:bg-pink-500' },
    { name: 'agentPlan', price: 25, features: ['feature5', 'feature6', 'feature7', 'feature8'], recommended: false, ctaColor: 'bg-slate-700 hover:bg-slate-600' }
  ];

  const sectionBackgrounds = {
    hero: `url('https://picsum.photos/id/1074/1920/1080')`,
    features: `url('https://picsum.photos/id/1062/1920/1080')`,
    about: `url('https://picsum.photos/id/1041/1920/1080')`,
    pricing: `url('https://picsum.photos/id/103/1920/1080')`,
    cta: `url('https://picsum.photos/id/12/1920/1080')`,
    contact: `url('https://picsum.photos/id/1015/1920/1080')`
  };

  return (
    <div className="bg-slate-900 text-slate-200">
      <style>
        {` html { scroll-behavior: smooth; } `}
      </style>
      <header className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <a href="#hero" className="flex items-center space-x-3">
            <img src="https://picsum.photos/id/237/40/40" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-base sm:text-lg md:text-xl font-bold text-white whitespace-nowrap">HNV Property Management Solutions</span>
          </a>
          <nav className="hidden lg:flex items-center space-x-6">
            <a href="#features" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.features')}</a>
            <a href="#about" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.about')}</a>
            <a href="#pricing" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.pricing')}</a>
            <a href="#contact" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.contact')}</a>
          </nav>
          <div className="hidden lg:flex items-center space-x-4">
            {deferredPrompt && (
              <button onClick={handleInstallClick} title={t('header.installApp')} className="text-slate-300 hover:text-white font-semibold flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
            )}
            <Link to="/login" className="text-slate-300 font-semibold hover:text-white transition-colors">{t('header.login')}</Link>
            <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-5 rounded-lg shadow-lg hover:shadow-yellow-400/50 transition-all">
              {t('header.getStarted')}
            </Link>
          </div>
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="lg:hidden px-6 pt-2 pb-4 space-y-2 absolute w-full bg-slate-900/95 shadow-xl" onClick={() => setIsMenuOpen(false)}>
            <a href="#features" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.features')}</a>
            <a href="#about" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.about')}</a>
            <a href="#pricing" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.pricing')}</a>
            <a href="#contact" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.contact')}</a>
            <hr className="my-2 border-slate-700" />
            <div className="flex items-center justify-between py-2">
               <span className="text-sm font-medium text-slate-400">Language:</span>
               <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'en' ? 'bg-yellow-500 text-slate-900' : 'text-slate-400'}`}>EN</button>
                    <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'bn' ? 'bg-yellow-500 text-slate-900' : 'text-slate-400'}`}>BN</button>
                    <button onClick={() => changeLanguage('es')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'es' ? 'bg-yellow-500 text-slate-900' : 'text-slate-400'}`}>ES</button>
                </div>
            </div>
             {deferredPrompt && (
                <button onClick={handleInstallClick} className="w-full text-left py-2 text-slate-300 hover:text-white font-semibold flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>{t('header.installApp')}</span>
                </button>
              )}
            <hr className="my-2 border-slate-700" />
            <Link to="/login" className="block py-2 text-slate-300 font-semibold hover:text-white">{t('header.login')}</Link>
            <Link to="/register" className="block w-full mt-2 text-center bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold py-2 px-4 rounded-lg">{t('header.getStarted')}</Link>
          </div>
        )}
      </header>

      <main>
        <section id="hero" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.5)), ${sectionBackgrounds.hero}`}} className="relative bg-cover bg-center text-white py-24 sm:py-40">
          <div className="container mx-auto px-6 text-center sm:text-left relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">{t('hero.title')}</h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto sm:mx-0 mb-10">{t('hero.subtitle')}</p>
            <Link to="/register" className="bg-yellow-500 text-slate-900 font-bold py-3 px-6 md:py-4 md:px-10 rounded-lg text-base md:text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-400/50 transform hover:scale-105">
                {t('hero.cta')}
            </Link>
          </div>
        </section>
        
        <section id="features" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.features}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('features.title')}</h2>
              <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('features.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card1Title')}</h3>
                <p className="text-slate-300">{t('features.card1Text')}</p>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card2Title')}</h3>
                <p className="text-slate-300">{t('features.card2Text')}</p>
              </div>
              <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300">
                <h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card3Title')}</h3>
                <p className="text-slate-300">{t('features.card3Text')}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.about}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold">{t('about.title')}</h2>
                  <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.subtitle')}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                  <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                      <h3 className="text-2xl font-bold text-pink-400 mb-4">{t('about.missionTitle')}</h3>
                      <p className="mb-8 text-slate-300 leading-relaxed">{t('about.missionText')}</p>
                      <h3 className="text-2xl font-bold text-pink-400 mb-4">{t('about.visionTitle')}</h3>
                      <p className="text-slate-300 leading-relaxed">{t('about.visionText')}</p>
                  </div>
                   <div className="rounded-2xl overflow-hidden shadow-xl">
                      <img src="https://picsum.photos/id/1043/600/400" alt="Team Vision" className="w-full h-auto object-cover"/>
                  </div>
              </div>
               <div className="text-center mt-20">
                  <h2 className="text-3xl font-bold">{t('about.teamTitle')}</h2>
                  <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.teamSubtitle')}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">
                  {executives.map((exec, index) => (
                      <div key={index} className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-105 border border-slate-700">
                          <img src={exec.img} alt={exec.name} className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-pink-500" />
                          <h3 className="text-xl font-semibold text-white">{exec.name}</h3>
                          <p className="text-pink-400 font-medium">{exec.title}</p>
                      </div>
                  ))}
              </div>
          </div>
        </section>

        <section id="pricing" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.pricing}`}} className="relative bg-cover bg-center py-20 text-white">
          {/* Full Pricing Content */}
        </section>
      </main>
      
       <footer id="contact" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.contact}`}} className="relative bg-cover bg-center text-gray-300 py-16">
           <div className="container mx-auto px-6 relative z-10">
               {/* Full Footer Content */}
           </div>
      </footer>
    </div>
  );
};

// Wrapper component to provide the i18n instance
const AppWrapper = () => (
  <I18nextProvider i18n={i18n}>
    <LandingPageContent />
  </I18nextProvider>
);

export default AppWrapper;
