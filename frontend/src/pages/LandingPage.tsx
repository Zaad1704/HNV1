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

    // Other useEffects for PWA and Language Detection remain the same...
    useEffect(() => { /* PWA Logic */ }, []);
    useEffect(() => { /* Language Detection Logic */ }, []);


    const handleFeedbackSubmit = async (e: React.FormEvent) => { /* ... remains the same ... */ };
    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { /* ... remains the same ... */ };
    const changeLanguage = (langCode: string) => { /* ... remains the same ... */ };

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
            {/* Header and other sections remain the same */}
            <header> {/* ... */} </header>
            
            <main>
                {/* hero, features, about sections... */}

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
                                    {/* You can add a description field to your Plan model and display it here */}
                                    
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

                                    {/* --- FIX: This link now points to the subscription page --- */}
                                    <Link
                                        to={`/subscribe/${plan._id}`}
                                        className={`w-full text-center font-bold py-3 px-6 rounded-lg transition-all ${plan.name.includes('Agent') ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                                    >
                                        Choose Plan
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* cta and footer sections... */}
            </main>
            <footer>{/* ... */}</footer>
        </div>
    );
};

// AppWrapper remains the same
const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
