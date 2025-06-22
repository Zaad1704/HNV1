import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

interface IPlan {
  _id: string;
  name: string;
  price: number;
  duration: 'daily' | 'weekly' | 'monthly' | 'yearly';
  features: string[];
  description?: string;
}

interface PricingPlanCardProps {
  plan: IPlan;
}

const PricingPlanCard: React.FC<PricingPlanCardProps> = ({ plan }) => {
  const { currencyName } = useLang();
  const { t } = useTranslation();

  const getPrice = (priceInCents: number) => {
    if (priceInCents === 0) return t('pricing.free');
    // Convert USD cents to BDT (mock rate for now, needs real API for accuracy)
    const exchangeRate = currencyName === '৳' ? 110 : 1;
    return `${currencyName}${(priceInCents / 100 * exchangeRate).toFixed(2)}`;
  };

  return (
    <div className="bg-light-card dark:bg-dark-card border border-border-color dark:border-border-color-dark rounded-2xl p-8 text-left flex flex-col shadow-lg">
      <h3 className="text-2xl font-bold text-brand-orange">{plan.name}</h3>
      <p className="mt-4 text-4xl font-extrabold text-dark-text dark:text-dark-text-dark">
        {getPrice(plan.price)}
        {plan.price > 0 && (
          <span className="text-base font-medium text-slate-500 dark:text-light-text-dark">
            {" "}
            / {plan.duration}
          </span>
        )}
      </p>
      <p className="mt-2 text-slate-500 dark:text-light-text-dark h-12">{plan.description || t('pricing.choose_plan', { plan: plan.name })}</p>
      <ul className="space-y-3 mt-8 flex-grow">
        {plan.features.map((feature: string, index: number) => (
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
          {t('pricing.choose_plan')}
        </Link>
      </div>
    </div>
  );
};

export default PricingPlanCard;
