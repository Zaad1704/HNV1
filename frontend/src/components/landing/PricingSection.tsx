// frontend/src/components/landing/PricingSection.tsx
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
    <section className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold text-dark-text">
        {t('pricing.title')}
      </h2>
      <p className="mt-4 text-light-text max-w-2xl mx-auto">
        {t('pricing.subtitle')}
      </p>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map(plan => (
          <PricingPlanCard key={plan._id} plan={plan} />
        ))}
      </div>
      <p className="text-light-text text-xs mt-8">
        {t('pricing.disclaimer')}
      </p>
    </section>
  );
};

export default PricingSection;
