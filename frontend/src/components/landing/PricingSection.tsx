import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { CheckCircle } from 'lucide-react';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
import { useLang } from '../../contexts/LanguageContext';

const PricingSection = () => {
    const { data: settings } = useSiteSettings();
    const { currencyName } = useLang();
    const [plans, setPlans] = useState<any[]>([]);

    const { translatedText: translatedTitle } = useDynamicTranslation(settings?.pricingSection?.title || 'Choose The Plan That\'s Right For You');
    const { translatedText: translatedSubtitle } = useDynamicTranslation(settings?.pricingSection?.subtitle || 'Simple, transparent pricing to help you grow. No hidden fees, cancel anytime.');
    const { translatedText: translatedDisclaimer } = useDynamicTranslation(settings?.pricingSection?.disclaimer || 'Subscription and billing are managed securely through our payment partner.');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const { data } = await apiClient.get('/plans');
                setPlans(data.data.filter(p => p.isPublic));
            } catch (error) {
                console.error("Could not fetch pricing plans", error);
            }
        };
        fetchPlans();
    }, []);

    const getPrice = (priceInCents: number) => {
        if (priceInCents === 0) return "Free";
        const exchangeRate = currencyName === '৳' ? 110 : 1;
        return `${currencyName}${(priceInCents / 100 * exchangeRate).toFixed(2)}`;
    }

    return (
        <section id="pricingSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{translatedTitle}</h2>
                <p className="mt-4 text-slate-600 dark:text-light-text-dark max-w-2xl mx-auto">{translatedSubtitle}</p>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map(plan => {
                        const { translatedText: translatedPlanName } = useDynamicTranslation(plan.name);
                        const translatedFeatures = plan.features.map((feature: string) => {
                            const { translatedText: translatedFeature } = useDynamicTranslation(feature);
                            return translatedFeature;
                        });

                        return (
                            <div key={plan._id} className="bg-light-card dark:bg-dark-card border border-border-color dark:border-border-color-dark rounded-2xl p-8 text-left flex flex-col shadow-lg">
                                <h3 className="text-2xl font-bold text-brand-orange">{translatedPlanName}</h3>
                                <p className="mt-4 text-4xl font-extrabold text-dark-text dark:text-dark-text-dark">
                                    {getPrice(plan.price)}
                                    {plan.price > 0 && <span className="text-base font-medium text-slate-500 dark:text-light-text-dark"> / {plan.duration}</span>}
                                </p>
                                <p className="mt-2 text-slate-500 dark:text-light-text-dark h-12">{plan.description || `For ${plan.name}s`}</p>
                                
                                <ul className="space-y-3 mt-8 flex-grow">
                                    {translatedFeatures.map((feature: string, index: number) => ( // --- CHANGE: Removed misplaced comment ---
                                        <li key={index} className="flex items-center text-dark-text dark:text-light-text-dark">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8">
                                    <Link 
                                        to={`/register?plan=${plan._id}`}
                                        className="block w-full text-center bg-brand-orange text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        Choose Plan
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
                 <p className="text-xs text-slate-500 dark:text-light-text-dark mt-8">{translatedDisclaimer}</p>
            </div>
        </section>
    );
};

export default PricingSection;
