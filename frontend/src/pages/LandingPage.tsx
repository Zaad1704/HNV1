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

    // FIX: State for pricing plans will now be fetched from the API
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);

    const [feedback, setFeedback] = useState({ name: '', email: '', subject: '', message: '' });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // This useEffect hook fetches the plans when the page loads
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                // We only show plans that are marked as public
                setPricingPlans(response.data.data.filter(p => p.isPublic));
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
            }
        };
        fetchPlans();
    }, []);

    // Other useEffects remain the same
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    useEffect(() => {
        const fetchUserLocale = async () => {
            const apiKey = '7903077ee3c324';
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

    // All handler functions remain the same
    const handleInstallClick = async () => { /* ... */ };
    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFeedback({ ...feedback, [e.target.name]: e.target.value });
    const handleFeedbackSubmit = async (e: React.FormEvent) => { /* ... */ };
    const changeLanguage = (langCode: string) => {
        const newLang = (supportedLanguages as any)[langCode];
        if (newLang) {
            i18n.changeLanguage(langCode);
            setCurrency(newLang.currency);
        }
    };
    
    // Data for other sections remains the same
    const executives = [/* ... */];
    const sectionBackgrounds = {/* ... */};

    return (
        <div className="bg-slate-900 text-slate-200">
            <style>{` html { scroll-behavior: smooth; } `}</style>
            <header> {/* ... Your full header JSX ... */} </header>
            
            <main>
                {/* hero, features, about sections... */}
                <section id="hero"> {/* ... */} </section>
                <section id="features"> {/* ... */} </section>
                <section id="about"> {/* ... */} </section>

                <section id="pricing" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.pricing}`}} className="relative bg-cover bg-center py-20 text-white">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">{t('pricing.title')}</h2>
                            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{t('pricing.subtitle')}</p>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                            {pricingPlans.map((plan) => (
                                <div key={plan._id} className={`bg-slate-800/70 backdrop-blur-md p-8 rounded-2xl flex flex-col border transition-all duration-300 ${plan.name.includes('Agent') ? 'border-2 border-yellow-500 scale-105' : 'border-slate-700 hover:border-slate-500'}`}>
                                    <h3 className={`text-2xl font-bold ${plan.name.includes('Agent') ? 'text-yellow-400' : 'text-white'}`}>{plan.name}</h3>
                                    
                                    <div className="flex items-baseline mt-4 mb-8">
                                        <span className="text-4xl font-extrabold text-white">{currency.symbol}{Math.round((plan.price / 100) * currency.rate)}</span>
                                        {plan.price > 0 && <span className="text-slate-400 ml-2">/ {plan.duration}</span>}
                                    </div>
                                    <ul className="space-y-3 text-slate-300 mb-8 flex-grow">
                                        {plan.features.map((feature: string) => (
                                            <li key={feature} className="flex items-center">
                                                <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* FIX: This link now points to the subscription page for the specific plan */}
                                    <Link
                                        to={`/subscribe/${plan._id}`}
                                        className={`w-full mt-auto text-center font-bold py-3 px-6 rounded-lg transition-all ${plan.name.includes('Agent') ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                    >
                                        Choose Plan
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                <section id="cta"> {/* ... */} </section>
            </main>
            
            <footer id="contact"> {/* ... Your full footer JSX with the feedback form ... */} </footer>
        </div>
    );
};

const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
