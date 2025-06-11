import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n'; // Ensure this path is correct

const LandingPageContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- PWA Installation Logic ---
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };
  
  // --- Language & Currency Logic ---
  useEffect(() => {
    const fetchUserLocale = async () => {
        // In a real app, use an IP geolocation API. For now, we simulate.
        const simulatedCountry = 'GB'; // Test with 'BD', 'ES', 'GB'
        let lang = 'en', curr = { code: 'USD', symbol: '$', rate: 1 };

        if (simulatedCountry === 'BD') {
            lang = 'bn';
            curr = { code: 'BDT', symbol: '৳', rate: 117 };
        } else if (simulatedCountry === 'ES') {
            lang = 'es';
            curr = { code: 'EUR', symbol: '€', rate: 0.92 };
        }
        
        // Show a confirmation prompt to the user
        if (lang !== 'en' && window.confirm(`It looks like you're in ${simulatedCountry}. Would you like to switch to your local language?`)) {
            i18n.changeLanguage(lang);
            setCurrency(curr);
        } else {
            // Default to English
            i18n.changeLanguage('en');
            setCurrency({ code: 'USD', symbol: '$', rate: 1 });
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
  
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://placehold.co/150x150/7c3aed/ffffff?text=CEO" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://placehold.co/150x150/db2777/ffffff?text=CTO" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://placehold.co/150x150/16a34a/ffffff?text=COO" }
  ];

  return (
    <div className="bg-slate-900 text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="https://placehold.co/40x40/2563eb/ffffff?text=HNV" alt="HNV Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-base sm:text-lg md:text-xl font-bold text-white whitespace-nowrap">HNV Property Management Solutions</span>
          </div>
          <nav className="hidden lg:flex items-center space-x-6">
            <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">{t('header.features')}</button>
            <button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">{t('header.about')}</button>
            <button onClick={() => scrollToSection('pricing')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">{t('header.pricing')}</button>
            <button onClick={() => scrollToSection('contact')} className="text-slate-300 hover:text-teal-400 font-medium transition-colors">{t('header.contact')}</button>
          </nav>
          <div className="hidden lg:flex items-center space-x-4">
            {deferredPrompt && (
              <button onClick={handleInstallClick} className="text-slate-300 hover:text-white font-semibold flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>
            )}
            <Link to="/login" className="text-slate-300 font-semibold hover:text-white transition-colors">{t('header.login')}</Link>
            <Link to="/register" className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-5 rounded-lg shadow-lg hover:shadow-teal-500/50 transition-all">
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
          <div className="lg:hidden px-6 pt-2 pb-4 space-y-2 absolute w-full bg-slate-900/95 shadow-xl">
            {/* Mobile Nav Links */}
            <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-400">Language:</span>
                 <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                      <button onClick={() => changeLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'en' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>EN</button>
                      <button onClick={() => changeLanguage('bn')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'bn' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>BN</button>
                      <button onClick={() => changeLanguage('es')} className={`px-2 py-1 text-xs font-bold rounded ${i18n.language === 'es' ? 'bg-teal-600 text-white' : 'text-slate-400'}`}>ES</button>
                  </div>
            </div>
             {deferredPrompt && (
                <button onClick={handleInstallClick} className="w-full text-left py-2 text-slate-300 hover:text-white font-semibold flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Install App</span>
                </button>
              )}
            <hr className="my-2 border-slate-700" />
            <Link to="/login" className="block py-2 text-slate-300 font-semibold hover:text-white">{t('header.login')}</Link>
            <Link to="/register" className="block w-full mt-2 text-center bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg">{t('header.getStarted')}</Link>
          </div>
        )}
      </header>

      {/* Other sections with the new lively color scheme */}
    </div>
    </>
  );
};

const AppWrapper = () => (
  <I18nextProvider i18n={i18n}>
    <LandingPageContent />
  </I18nextProvider>
);

export default AppWrapper;
