import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client';

const supportedLanguages = {
    en: { name: 'EN', nativeName: 'English', currency: { code: 'USD', symbol: '$', rate: 1 }, countries: ['US', 'GB', 'CA', 'AU', 'IE', 'NZ'] },
    bn: { name: 'BN', nativeName: 'বাংলা', currency: { code: 'BDT', symbol: '৳', rate: 117 }, countries: ['BD'] },
    es: { name: 'ES', nativeName: 'Español', currency: { code: 'EUR', symbol: '€', rate: 0.92 }, countries: ['ES', 'MX', 'AR', 'CO', 'CL'] }
};

const LandingPageContent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [languageOptions, setLanguageOptions] = useState<any[]>([]);
    
    // NEW: State for pricing plans to be fetched from API
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);

    const [feedback, setFeedback] = useState({ name: '', email: '', subject: '', message: '' });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // NEW: useEffect to fetch plans from the backend
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic));
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
            }
        };
        fetchPlans();
    }, []);

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

    useEffect(() => {
        const fetchUserLocale = async () => {
            const apiKey = '7903077ee3c324'; // Using the key you provided earlier.
            try {
                const response = await fetch(`https://ipinfo.io/json?token=${apiKey}`);
                if (!response.ok) throw new Error('Failed to fetch IP info');
                const data = await response.json();
                const userCountry = data.country;
                const detectedLangCode = Object.keys(supportedLanguages).find(langCode => 
                    (supportedLanguages as any)[langCode].countries.includes(userCountry)
                );
                const defaultLang = supportedLanguages.en;
                const detectedLang = (supportedLanguages as any)[detectedLangCode || 'en'] || defaultLang;
                i18n.changeLanguage(detectedLangCode || 'en');
                setCurrency(detectedLang.currency);
                if (detectedLang.name !== 'EN') {
                    setLanguageOptions([detectedLang, defaultLang]);
                } else {
                    setLanguageOptions([defaultLang]);
                }
            } catch (error) {
                console.error("Could not fetch user locale, defaulting to English:", error);
                const defaultLang = supportedLanguages.en;
                i18n.changeLanguage('en');
                setCurrency(defaultLang.currency);
                setLanguageOptions([defaultLang]);
            }
        };
        fetchUserLocale();
    }, [i18n]); 

    const changeLanguage = (langCode: string) => {
        const newLang = (supportedLanguages as any)[langCode];
        if (newLang) {
            i18n.changeLanguage(langCode);
            setCurrency(newLang.currency);
        }
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFeedback({ ...feedback, [e.target.name]: e.target.value });
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormMessage({ type: '', text: '' });
        try {
            await apiClient.post('/feedback', feedback);
            setFormMessage({ type: 'success', text: 'Thank you! Your feedback has been sent.' });
            setFeedback({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to send feedback. Please try again later.';
            setFormMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://picsum.photos/id/1005/150/150" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://picsum.photos/id/1011/150/150" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://picsum.photos/id/1027/150/150" }
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
            <style>{` html { scroll-behavior: smooth; } `}</style>
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
                        {deferredPrompt && (<button onClick={handleInstallClick} title={t('header.installApp')} className="text-slate-300 hover:text-white font-semibold p-2 rounded-lg hover:bg-slate-700"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>)}
                        {languageOptions.length > 1 && (
                            <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-full p-1">
                                {languageOptions.map(lang => {
                                    const langCode = Object.keys(supportedLanguages).find(key => (supportedLanguages as any)[key] === lang);
                                    return (
                                        <button
                                            key={lang.name}
                                            onClick={() => changeLanguage(langCode!)}
                                            className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${i18n.language === langCode ? 'bg-yellow-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            {lang.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <Link to="/login" className="text-slate-300 font-semibold hover:text-white transition-colors">{t('header.login')}</Link>
                        <Link to="/register" className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-2 px-5 rounded-lg shadow-lg hover:shadow-yellow-400/50 transition-all">{t('header.getStarted')}</Link>
                    </div>
                    <div className="lg:hidden"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 focus:outline-none"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg></button></div>
                </div>
                {isMenuOpen && (
                    <div className="lg:hidden px-6 pt-2 pb-4 space-y-2 absolute w-full bg-slate-900/95 shadow-xl" onClick={() => setIsMenuOpen(false)}>
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
            <main>
                <section id="hero" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.5)), ${sectionBackgrounds.hero}`}} className="relative bg-cover bg-center text-white py-24 sm:py-40">
                    <div className="container mx-auto px-6 text-center sm:text-left relative z-10"><h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">{t('hero.title')}</h1><p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto sm:mx-0 mb-10">{t('hero.subtitle')}</p><Link to="/register" className="bg-yellow-500 text-slate-900 font-bold py-3 px-6 md:py-4 md:px-10 rounded-lg text-base md:text-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-yellow-400/50 transform hover:scale-105">{t('hero.cta')}</Link></div>
                </section>
                <section id="features" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.features}`}} className="relative bg-cover bg-center py-20 text-white">
                    <div className="container mx-auto px-6 relative z-10"><div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold">{t('features.title')}</h2><p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('features.subtitle')}</p></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300"><h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card1Title')}</h3><p className="text-slate-300">{t('features.card1Text')}</p></div><div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300"><h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card2Title')}</h3><p className="text-slate-300">{t('features.card2Text')}</p></div><div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-700 hover:border-teal-500 transition-all duration-300"><h3 className="text-xl font-bold text-teal-400 mb-3">{t('features.card3Title')}</h3><p className="text-slate-300">{t('features.card3Text')}</p></div></div></div>
                </section>
                <section id="about" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.about}`}} className="relative bg-cover bg-center py-20 text-white">
                    <div className="container mx-auto px-6 relative z-10"><div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold">{t('about.title')}</h2><p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.subtitle')}</p></div><div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto"><div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700"><h3 className="text-2xl font-bold text-pink-400 mb-4">{t('about.missionTitle')}</h3><p className="mb-8 text-slate-300 leading-relaxed">{t('about.missionText')}</p><h3 className="text-2xl font-bold text-pink-400 mb-4">{t('about.visionTitle')}</h3><p className="text-slate-300 leading-relaxed">{t('about.visionText')}</p></div><div className="rounded-2xl overflow-hidden shadow-xl"><img src="https://picsum.photos/id/1043/600/400" alt="Team Vision" className="w-full h-auto object-cover"/></div></div><div className="text-center mt-20"><h2 className="text-3xl font-bold">{t('about.teamTitle')}</h2><p className="text-slate-300 mt-4 max-w-2xl mx-auto">{t('about.teamSubtitle')}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">{executives.map((exec, index) => (<div key={index} className="bg-slate-800/70 backdrop-blur-md p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:scale-105 border border-slate-700"><img src={exec.img} alt={exec.name} className="w-32 h-32 rounded-full mx-auto mb-5 border-4 border-pink-500" /><h3 className="text-xl font-semibold text-white">{exec.name}</h3><p className="text-pink-400 font-medium">{exec.title}</p></div>))}</div></div>
                </section>
                <section id="pricing" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.pricing}`}} className="relative bg-cover bg-center py-20 text-white">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold text-white">{t('pricing.title')}</h2><p className="text-slate-400 mt-4 max-w-2xl mx-auto">{t('pricing.subtitle')}</p></div>
                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                            {pricingPlans.map((plan) => (
                                <div key={plan._id} className={`bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl flex flex-col border transition-all duration-300 ${plan.name.includes('Agent') ? 'border-2 border-yellow-500 scale-105' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <h3 className={`text-2xl font-bold ${plan.name.includes('Agent') ? 'text-yellow-400' : 'text-white'}`}>{plan.name}</h3>
                                    <div className="flex items-baseline mt-4 mb-8"><span className="text-4xl font-extrabold text-white">{currency.symbol}{plan.price === 0 ? '0' : Math.round((plan.price / 100) * currency.rate)}</span>{plan.price > 0 && <span className="text-slate-400 ml-2">/ {plan.duration}</span>}</div>
                                    <ul className="space-y-3 text-slate-300 mb-8 flex-grow">{plan.features.map((feature: string) => (<li key={feature} className="flex items-center"><svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{feature}</li>))}</ul>
                                    <Link to={`/subscribe/${plan._id}`} className={`w-full mt-auto text-center font-bold py-3 px-6 rounded-lg transition-all ${plan.name.includes('Agent') ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>{plan.price === 0 ? 'Start Trial' : 'Choose Plan'}</Link>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-16">
                            <p className="text-slate-300">Need a custom enterprise plan or a one-time payment option for lifetime access?</p>
                            <a href="#contact" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors mt-2 inline-block">Please contact us to discuss your requirements.</a>
                        </div>
                    </div>
                </section>
                <section id="cta" style={{backgroundImage: sectionBackgrounds.cta}} className="relative bg-cover bg-center py-20">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div><div className="container mx-auto px-6 text-center relative z-10"><h2 className="text-3xl font-bold text-white">{t('cta.title')}</h2><p className="mt-4 mb-8 text-slate-300 max-w-xl mx-auto">{t('cta.subtitle')}</p><Link to="/register" className="bg-yellow-500 text-slate-900 font-bold py-3 px-8 rounded-lg text-lg hover:bg-yellow-400 shadow-lg hover:shadow-yellow-400/50">{t('cta.button')}</Link></div>
                </section>
            </main>
            <footer id="contact" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.contact}`}} className="relative bg-cover bg-center text-gray-300 py-16">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-white">Share Your Feedback & Ideas</h2><p className="text-cyan-300 mt-4 max-w-2xl mx-auto">Have a suggestion, complaint, or a feature request? We'd love to hear from you!</p></div>
                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <div className="space-y-8">
                            <div><h3 className="text-xl font-semibold text-white mb-2">{t('contact.officeTitle')}</h3><p className="text-slate-400">123 Property Lane, Suite 400<br/>Management City, MC 54321</p></div>
                            <div><h3 className="text-xl font-semibold text-white mb-2">{t('contact.phoneTitle')}</h3><p className="text-slate-400">General: (555) 123-4567<br/>Support: (555) 765-4321</p></div>
                            <div><h3 className="text-xl font-semibold text-white mb-2">{t('contact.emailTitle')}</h3>
