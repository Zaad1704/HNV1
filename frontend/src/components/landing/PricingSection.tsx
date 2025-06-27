import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';

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
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['publicPlans'],
    queryFn: fetchPlans
  });

  const defaultPlans: Plan[] = [
    {
      _id: '1',
      name: 'Free Trial',
      price: 0,
      duration: 'monthly',
      features: ['1 Property', '5 Tenants', '1 User', 'Basic Support'],
      isPublic: true
    },
    {
      _id: '2',
      name: 'Landlord Plan',
      price: 10,
      duration: 'monthly',
      features: ['Up to 10 Properties', 'Full Tenant Screening', 'Expense Tracking', 'Email Support'],
      isPopular: true,
      isPublic: true
    },
    {
      _id: '3',
      name: 'Agent Plan',
      price: 25,
      duration: 'monthly',
      features: ['Unlimited Properties', 'Advanced Reporting', 'Vendor Management', 'Priority Phone Support'],
      isPublic: true
    },
  ];

  const pricingPlans = plans.length > 0 ? plans : defaultPlans;

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 bg-light-bg dark:bg-dark-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="w-8 h-8 bg-brand-primary rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-light-text dark:text-light-text-dark">Loading pricing plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-light-bg dark:bg-dark-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-light-text dark:text-light-text-dark text-lg max-w-2xl mx-auto mb-8">
            Choose the plan that fits your portfolio size and needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan: Plan, index: number) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-light-card dark:bg-dark-card rounded-3xl p-8 border transition-all duration-300 hover:shadow-lg ${
                plan.isPopular 
                  ? 'border-brand-primary shadow-lg scale-105 bg-gradient-to-br from-brand-primary to-brand-secondary text-white' 
                  : 'border-border-color dark:border-border-color-dark hover:border-brand-primary'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-brand-primary px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.isPopular ? 'text-white' : 'text-dark-text dark:text-dark-text-dark'
                }`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${
                    plan.isPopular ? 'text-white' : 'text-dark-text dark:text-dark-text-dark'
                  }`}>
                    ${plan.price}
                  </span>
                  <span className={`${
                    plan.isPopular ? 'text-gray-200' : 'text-light-text dark:text-light-text-dark'
                  }`}>
                    /{plan.duration}
                  </span>
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
                      plan.isPopular ? 'text-gray-100' : 'text-light-text dark:text-light-text-dark'
                    }`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/register?plan=${plan._id}`}
                className={`w-full block text-center py-3 px-6 rounded-2xl font-semibold transition-all hover:transform hover:scale-105 ${
                  plan.isPopular
                    ? 'bg-white text-brand-primary hover:bg-gray-100'
                    : 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-lg'
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