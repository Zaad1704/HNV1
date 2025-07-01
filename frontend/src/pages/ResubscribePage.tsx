import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResubscribePage = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      features: ['Up to 10 properties', 'Basic tenant management', 'Email support']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      features: ['Up to 50 properties', 'Advanced analytics', 'Priority support', 'Agent management'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: ['Unlimited properties', 'White-label solution', '24/7 phone support', 'Custom integrations']
    }
  ];

  const handleResubscribe = async () => {
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    // Redirect to success page
  };

  return (
    <div className="min-h-screen bg-app-bg py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Reactivate Your Subscription
          </h1>
          <p className="text-text-secondary text-lg">
            Your subscription has expired. Choose a plan to continue using HNV Property Management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative app-surface rounded-3xl p-8 border transition-all duration-300 cursor-pointer ${
                selectedPlan === plan.id
                  ? 'border-brand-blue shadow-app-lg scale-105'
                  : 'border-app-border hover:border-brand-orange'
              } ${plan.popular ? 'gradient-dark-orange-blue text-white' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-brand-orange px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-text-primary'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-text-primary'}`}>
                    ${plan.price}
                  </span>
                  <span className={`${plan.popular ? 'text-gray-200' : 'text-text-secondary'}`}>
                    /month
                  </span>
                </div>
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-white/20' : 'bg-green-100'
                    }`}>
                      <Check size={12} className={`${plan.popular ? 'text-white' : 'text-green-600'}`} />
                    </div>
                    <span className={`${plan.popular ? 'text-gray-100' : 'text-text-secondary'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={handleResubscribe}
            disabled={loading}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CreditCard size={20} />
            )}
            {loading ? 'Processing...' : 'Reactivate Subscription'}
          </button>
          
          <p className="text-text-muted text-sm mt-4">
            Need help? <Link to="/contact" className="text-brand-blue hover:underline">Contact Support</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ResubscribePage;