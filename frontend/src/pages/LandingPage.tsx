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

    // --- REFINED: Language & Currency Logic (No Pop-up) ---
    useEffect(() => {
        const fetchUserLocale = async () => {
            try {
                const response = await fetch('http://ip-api.com/json');
                if (!response.ok) throw new Error('Failed to fetch IP info');
                
                const data = await response.json();
                const countryCode = data.countryCode;

                // Set initial language based on country without a pop-up
                if (countryCode === 'BD') {
                    i18n.changeLanguage('bn');
                    setCurrency({ code: 'BDT', symbol: '৳', rate: 117 });
                } else if (countryCode === 'ES') {
                    i18n.changeLanguage('es');
                    setCurrency({ code: 'EUR', symbol: '€', rate: 0.92 });
                } else {
                    // Default for all other countries
                    i18n.changeLanguage('en');
                    setCurrency({ code: 'USD', symbol: '$', rate: 1 });
                }
            } catch (error) {
                console.error("Could not fetch user locale, defaulting to English:", error);
                i18n.changeLanguage('en');
                setCurrency({ code: 'USD', symbol: '$', rate: 1 });
            }
        };

        fetchUserLocale();
    }, []); // Removed [i18n] dependency to ensure this runs only once on initial load

    // This function is still used by the manual language switcher
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        if (lng === 'bn') setCurrency({ code: 'BDT', symbol: '৳', rate: 117 });
        else if (lng === 'es') setCurrency({ code: 'EUR', symbol: '€', rate: 0.92 });
        else setCurrency({ code: 'USD', symbol: '$', rate: 1 });
    };

    const languages = [
        { code: 'en', name: 'EN' },
        { code: 'bn', name: 'BN' },
        { code: 'es', name: 'ES' }
    ];

    // The rest of your component data (executives, pricing, etc.) remains the same
    const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://picsum.photos/id/1005/150/150" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://picsum.photos/id/1011/150/150" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://picsum.photos/id/1027/150/150" }
    ];
    const pricingPlans = [
      { nameKey: 'trialPlan', descKey: 'trialDesc', price: 0, features: ['featureTrial1', 'featureTrial2', 'featureTrial3'], recommended: false, ctaColor: 'bg-slate-700 hover:bg-slate-600', textColor: 'text-white' },
      { nameKey: 'landlordPlan', descKey: 'landlordDesc', price: 10, features: ['feature1', 'feature2', 'feature3', 'feature4'], recommended: true, ctaColor: 'bg-yellow-500 hover:bg-yellow-400', textColor: 'text-slate-900' },
      { nameKey: 'agentPlan', descKey: 'agentDesc', price: 25, features: ['feature5', 'feature6', 'feature7', 'feature8'], recommended: false, ctaColor: 'bg-slate-700 hover:bg-slate-600', textColor: 'text-white' }
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
                        <span className="text-base sm:text-lg md:text-xl font-bold text-white whitespace-nowrap">HNV Property Management</span>
                    </a>
                    <nav className="hidden lg:flex items-center space-x-6">
                        <a href="#features" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.features')}</a>
                        <a href="#about" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.about')}</a>
                        <a href="#pricing" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.pricing')}</a>
                        <a href="#contact" className="text-slate-300 hover:text-yellow-400 font-medium transition-colors">{t('header.contact')}</a>
                    </nav>
                    <div className="hidden lg:flex items-center space-x-4">
                        {deferredPrompt && (
                            <button onClick={handleInstallClick} title={t('header.installApp')} className="text-slate-300 hover:text-white font-semibold p-2 rounded-lg hover:bg-slate-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            </button>
                        )}

                        {/* --- NEW: Language "Slider" --- */}
                        <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-full p-1">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${i18n.language === lang.code ? 'bg-yellow-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>

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
                        {/* Mobile menu content... */}
                        <a href="#features" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.features')}</a>
                        <a href="#about" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.about')}</a>
                        <a href="#pricing" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.pricing')}</a>
                        <a href="#contact" className="block w-full text-left py-2 text-slate-300 hover:text-white">{t('header.contact')}</a>
                        <hr className="my-2 border-slate-700" />
                        <Link to="/login" className="block py-2 text-slate-300 font-semibold hover:text-white">{t('header.login')}</Link>
                        <Link to="/register" className="block w-full mt-2 text-center bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold py-2 px-4 rounded-lg">{t('header.getStarted')}</Link>
                    </div>
                )}
            </header>

            {/* The rest of your main and footer JSX remains unchanged */}
            <main>
                {/* All your sections: hero, features, about, etc. */}
            </main>
            <footer id="contact">
                {/* Your footer content */}
            </footer>
        </div>
    );
};

const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
