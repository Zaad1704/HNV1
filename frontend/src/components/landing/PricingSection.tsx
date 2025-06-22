import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { useTranslation } from 'react-i18next';
import PricingPlanCard from './PricingPlanCard';

const PricingSection = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await apiClient.get('/plans');
        setPlans(data.data.filter((p: any) => p.isPublic));
      } catch (error) {
        console.error("Could not fetch pricing plans", error);
      }
    };
    fetchPlans();
  }, []);

  return (
    <section id="pricingSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">
          {t('pricing.title')}
        </h2>
        <p className="mt-4 text-slate-600 dark:text-light-text-dark max-w-2xl mx-auto">
          {t('pricing.subtitle')}
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map(plan => (
            <PricingPlanCard key={plan._id} plan={plan} />
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-light-text-dark mt-8">
          {t('pricing.disclaimer')}
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
