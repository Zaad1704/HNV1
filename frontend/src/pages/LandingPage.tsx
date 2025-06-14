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
                if (window.confirm(`Switch to ${localLanguageName}?`)) {
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
  
  // Using a more reliable placeholder service for background images
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
            <img src="https://placehold.co/40x40/f59e0b/0f172a?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
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
            {/* Full Features Content Here */}
          </div>
        </section>
        
        <section id="about" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.about}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
               {/* Full About Us Content Here */}
          </div>
        </section>

        <section id="pricing" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.pricing}`}} className="relative bg-cover bg-center py-20 text-white">
          <div className="container mx-auto px-6 relative z-10">
              {/* Full Pricing Content Here */}
          </div>
        </section>

      </main>
      
       <footer id="contact" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.contact}`}} className="relative bg-cover bg-center text-gray-300 py-16">
           <div className="container mx-auto px-6 relative z-10">
               {/* Full Footer Content Here */}
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
