import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Building2, Users, TrendingUp, Shield } from 'lucide-react';

interface LandscapeSectionProps {
  stats?: any;
}

const LandscapeSection: React.FC<LandscapeSectionProps> = ({ stats }) => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const features = [
    {
      icon: Building2,
      title: t('features.property_management'),
      description: t('features.property_management_desc'),
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: t('features.tenant_management'),
      description: t('features.tenant_management_desc'),
      color: 'text-green-500'
    },
    {
      icon: TrendingUp,
      title: t('features.financial_tracking'),
      description: t('features.financial_tracking_desc'),
      color: 'text-orange-500'
    },
    {
      icon: Shield,
      title: t('common.security', 'Security'),
      description: t('features.security_desc', 'Enterprise-grade security for your data'),
      color: 'text-purple-500'
    }
  ];

  return (
    <section id="landscape" className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Landscape Image - Full Image Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative mb-12 md:mb-16"
        >
          <div className="relative h-48 md:h-64 lg:h-96 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={settings?.landscapeSection?.imageUrl || "/about.jpg"}
              alt={t('landscape.image_alt', 'Property Management Platform')}
              className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
            />
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 ${feature.color}`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 bg-gradient-to-r from-brand-orange to-brand-blue rounded-2xl md:rounded-3xl p-6 md:p-8 text-white"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{stats?.totalProperties?.toLocaleString() || '10K+'}</div>
              <div className="text-xs md:text-sm opacity-90">{t('landing.properties_managed', 'Properties Managed')}</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{stats?.totalUsers?.toLocaleString() || '5K+'}</div>
              <div className="text-xs md:text-sm opacity-90">{t('landing.active_users', 'Active Users')}</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">{stats?.countriesServed || '50+'}</div>
              <div className="text-xs md:text-sm opacity-90">{t('landing.countries_served', 'Countries Served')}</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">99.9%</div>
              <div className="text-xs md:text-sm opacity-90">{t('landing.uptime_guarantee', 'Uptime Guarantee')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandscapeSection;