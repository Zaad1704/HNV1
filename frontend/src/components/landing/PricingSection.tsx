// frontend/src/components/landing/PricingSection.tsx
import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Keep if used elsewhere, removed if not needed.
import apiClient from '../../api/client';
import { useSiteSettings } from '../../hooks/useSiteSettings';
// import { CheckCircle } from 'lucide-react'; // No longer needed directly here
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
// import { useLang } from '../../contexts/LanguageContext'; // useLang only needed in PricingPlanCard
import PricingPlanCard from './PricingPlanCard'; // NEW IMPORT: Import the new component

const PricingSection = () => {
    const { data: settings } = useSiteSettings();
    // const { currencyName } = useLang(); // No longer needed directly here
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

    return (
        <section id="pricingSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{translatedTitle}</h2>
                <p className="mt-4 text-slate-600 dark:text-light-text-dark max-w-2xl mx-auto">{translatedSubtitle}</p>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map(plan => (
                        // Render the new PricingPlanCard component for each plan
                        <PricingPlanCard key={plan._id} plan={plan} />
                    ))}
                </div>
                 <p className="text-xs text-slate-500 dark:text-light-text-dark mt-8">{translatedDisclaimer}</p>
            </div>
        </section>
    );
};

export default PricingSection;
