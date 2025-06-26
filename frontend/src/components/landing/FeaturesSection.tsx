import React from 'react';
import { motion } from 'framer-motion';
import { IFeaturesPage } from '../../types/siteSettings';
import { Shield, Users, TrendingUp, Clock } from 'lucide-react';

interface FeaturesSectionProps {
  data?: IFeaturesPage;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ data }) => {
  const defaultFeatures = [
    {
      icon: 'Shield',
      title: 'Secure & Reliable',
      text: 'Bank-level security with 99.9% uptime guarantee',
      sectionId: 'security'
    },
    {
      icon: 'Users',
      title: 'Tenant Management',
      text: 'Streamline tenant communications and lease management',
      sectionId: 'tenants'
    },
    {
      icon: 'TrendingUp',
      title: 'Financial Insights',
      text: 'Track revenue, expenses, and profitability in real-time',
      sectionId: 'analytics'
    },
    {
      icon: 'Clock',
      title: '24/7 Support',
      text: 'Round-the-clock customer support when you need it',
      sectionId: 'support'
    }
  ];

  const features = data?.features || defaultFeatures;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return Shield;
      case 'Users': return Users;
      case 'TrendingUp': return TrendingUp;
      case 'Clock': return Clock;
      default: return Shield;
    }
  };

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
            {data?.title || 'Why Choose Our Platform?'}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {data?.subtitle || 'Built for modern property managers who demand efficiency, security, and growth.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature: any, index: number) => {
            const IconComponent = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;