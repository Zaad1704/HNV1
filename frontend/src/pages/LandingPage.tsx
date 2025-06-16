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
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    // All other state and useEffect hooks remain the same
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [languageOptions, setLanguageOptions] = useState<any[]>([]);
    const [feedback, setFeedback] = useState({ name: '', email: '', subject: '', message: '' });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // ... All other useEffects and handler functions remain the same ...

    const executives = [/* ... */];
    const sectionBackgrounds = {/* ... */};

    return (
        <div className="bg-slate-900 text-slate-200">
            {/* Header and all other sections remain the same */}
            <header> {/* ... */} </header>
            <main>
                {/* ... hero, features, about sections ... */}

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
                                        <span className="text-4xl font-extrabold text-white">{currency.symbol}{plan.price === 0 ? '0' : Math.round((plan.price / 100) * currency.rate)}</span>
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
                                    <Link to={`/subscribe/${plan._id}`} className={`w-full mt-auto text-center font-bold py-3 px-6 rounded-lg transition-all ${plan.name.includes('Agent') ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                                        {plan.price === 0 ? 'Start Trial' : 'Choose Plan'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                        
                        {/* --- NEW SECTION ADDED --- */}
                        <div className="text-center mt-16">
                            <p className="text-slate-300">
                                Need a custom enterprise plan or a one-time payment option for lifetime access?
                            </p>
                            <a href="#contact" className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors mt-2 inline-block">
                                Please contact us to discuss your requirements.
                            </a>
                        </div>
                    </div>
                </section>

                {/* ... cta section and footer ... */}
            </main>
            <footer> {/* ... */} </footer>
        </div>
    );
};

const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
