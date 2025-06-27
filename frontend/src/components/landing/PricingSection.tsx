import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useCurrencyRates, convertPrice, formatCurrency } from '../../services/currencyService';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isPublic: boolean;
}

const fetchPlans = async (): Promise<Plan[]> => {
  const { data } = await apiClient.get('/plans/public');
  return data.data;
};

const PricingSection = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['publicPlans'],
    queryFn: fetchPlans
  });
  const { data: exchangeRates = {}, isLoading: ratesLoading } = useCurrencyRates();

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
  ];

  const defaultPlans: Plan[] = [
    {
      _id: '1',
      name: 'Starter',
      price: 29,
      duration: 'monthly',
      features: ['Up to 5 properties', 'Basic tenant management', 'Email support'],
      isPublic: true
    },
    {
      _id: '2',
      name: 'Professional',
      price: 79,
      duration: 'monthly',
      features: ['Up to 25 properties', 'Advanced analytics', 'Priority support', 'Custom branding'],
      isPopular: true,
      isPublic: true
    },
    {
      _id: '3',
      name: 'Enterprise',
      price: 199,
      duration: 'monthly',
      features: ['Unlimited properties', 'White-label solution', '24/7 phone support', 'Custom integrations'],
      isPublic: true
    },
  ];

  const pricingPlans = plans.length > 0 ? plans : defaultPlans;

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 bg-app-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="w-8 h-8 app-gradient rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading pricing plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-app-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
            Choose the plan that fits your portfolio size and needs.
          </p>
          
          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Globe size={20} className="text-text-secondary" />
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-app-surface border border-app-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan: Plan, index: number) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative app-surface rounded-3xl p-8 border transition-all duration-300 hover:shadow-app-xl ${
                plan.isPopular 
                  ? 'border-brand-orange shadow-app-lg scale-105 gradient-dark-orange-blue text-white' 
                  : 'border-app-border hover:border-brand-orange'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-brand-orange px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.isPopular ? 'text-white' : 'text-text-primary'
                }`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${
                    plan.isPopular ? 'text-white' : 'text-text-primary'
                  }`}>
                    {selectedCurrency === 'USD' 
                      ? `$${plan.price}` 
                      : formatCurrency(
                          convertPrice(plan.price, 'USD', selectedCurrency, exchangeRates),
                          selectedCurrency
                        )
                    }
                  </span>
                  <span className={`${
                    plan.isPopular ? 'text-gray-200' : 'text-text-secondary'
                  }`}>
                    /{plan.duration}
                  </span>
                  {selectedCurrency !== 'USD' && !ratesLoading && (
                    <div className={`text-sm mt-1 ${
                      plan.isPopular ? 'text-gray-300' : 'text-text-muted'
                    }`}>
                      ≈ ${plan.price} USD
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.isPopular 
                        ? 'bg-white/20' 
                        : 'bg-green-100'
                    }`}>
                      <Check size={12} className={`${
                        plan.isPopular ? 'text-white' : 'text-green-600'
                      }`} />
                    </div>
                    <span className={`${
                      plan.isPopular ? 'text-gray-100' : 'text-text-secondary'
                    }`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/register?plan=${plan._id}`}
                className={`w-full block text-center py-3 px-6 rounded-2xl font-semibold transition-all hover:transform hover:scale-105 ${
                  plan.isPopular
                    ? 'bg-white text-brand-orange hover:bg-gray-100'
                    : 'gradient-dark-orange-blue text-white hover:shadow-lg'
                }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;