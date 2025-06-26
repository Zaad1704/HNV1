import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

interface PricingSectionProps {
  plans?: Plan[];
}

const PricingSection: React.FC<PricingSectionProps> = ({ plans }) => {
  const defaultPlans: Plan[] = [
    {
      _id: '1',
      name: 'Starter',
      price: 29,
      duration: 'monthly',
      features: ['Up to 5 properties', 'Basic tenant management', 'Email support'],
    },
    {
      _id: '2',
      name: 'Professional',
      price: 79,
      duration: 'monthly',
      features: ['Up to 25 properties', 'Advanced analytics', 'Priority support', 'Custom branding'],
      isPopular: true,
    },
    {
      _id: '3',
      name: 'Enterprise',
      price: 199,
      duration: 'monthly',
      features: ['Unlimited properties', 'White-label solution', '24/7 phone support', 'Custom integrations'],
    },
  ];

  const pricingPlans = plans || defaultPlans;

  return (
    <section className="py-20 bg-app-bg">
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
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
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
              className={`relative app-surface rounded-3xl p-8 border ${
                plan.isPopular 
                  ? 'border-brand-blue shadow-app-lg scale-105' 
                  : 'border-app-border'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="app-gradient text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-text-primary">
                    ${plan.price}
                  </span>
                  <span className="text-text-secondary">
                    /{plan.duration}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, featureIndex: number) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/payment-summary/${plan._id}`}
                className={`w-full block text-center py-3 px-6 rounded-2xl font-semibold transition-all ${
                  plan.isPopular
                    ? 'btn-gradient text-white'
                    : 'border border-app-border text-text-primary hover:bg-app-bg'
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