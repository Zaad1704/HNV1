import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '../../contexts/LanguageContext';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  limits: {
    maxProperties: number;
    maxTenants: number;
    maxAgents: number;
  };
}

const PricingSection: React.FC = () => {
  const { t } = useTranslation();
  const { convertPrice } = useLang();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans/public');
        const data = await response.json();
        if (data.success) {
          setPlans(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleGetStarted = (planName: string) => {
    window.location.href = `/register?plan=${encodeURIComponent(planName)}`;
  };

  if (loading) {
    return (
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('nav.pricing')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your property management needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan._id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                index === 1 
                  ? 'border-blue-500 scale-105 dark:border-blue-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 0 ? 'Free' : convertPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        /{plan.duration}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Up to {plan.limits.maxProperties} Properties</p>
                    <p>Up to {plan.limits.maxTenants} Tenants</p>
                    <p>Up to {plan.limits.maxAgents} Agents</p>
                  </div>
                  
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleGetStarted(plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    index === 1
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400">
            All plans include 24/7 support and a 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;