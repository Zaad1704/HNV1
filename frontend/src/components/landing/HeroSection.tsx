import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Building2, Users, CreditCard, BarChart3, Settings, Phone } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const heroCards = [
    {
      id: 'main',
      title: settings?.heroSection?.title || t('landing.hero_title'),
      subtitle: settings?.heroSection?.subtitle || t('landing.hero_subtitle'),
      isMain: true,
      cta: settings?.heroSection?.ctaText || t('landing.hero_cta'),
      icon: Building2
    },
    {
      id: 'properties',
      title: 'Properties',
      subtitle: 'Manage all your properties in one place',
      icon: Building2,
      action: () => scrollToSection('about')
    },
    {
      id: 'tenants',
      title: 'Tenants',
      subtitle: 'Keep track of tenant information and leases',
      icon: Users,
      action: () => scrollToSection('services')
    },
    {
      id: 'payments',
      title: 'Payments',
      subtitle: 'Process rent and track financial records',
      icon: CreditCard,
      action: () => scrollToSection('pricing')
    },
    {
      id: 'analytics',
      title: 'Analytics',
      subtitle: 'Get insights with detailed reports',
      icon: BarChart3,
      action: () => scrollToSection('leadership')
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Customize your experience',
      icon: Settings,
      action: () => scrollToSection('contact')
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section id="hero" className="py-20 md:py-32 bg-app-bg">
      <div className="container mx-auto px-4">
        <motion.div 
          className="hero-cards-grid"
          initial="hidden"
          animate="visible"
        >
          {heroCards.map((card, index) => {
            const IconComponent = card.icon;
            
            if (card.isMain) {
              return (
                <motion.div
                  key={card.id}
                  className="hero-card gradient-card md:col-span-2 md:row-span-2 flex flex-col justify-between min-h-[300px] relative overflow-hidden"
                  variants={cardVariants}
                  custom={index}
                >
                  {/* Custom Image Section - Admin Uploadable */}
                  {settings?.heroSection?.customImageUrl && (
                    <div className="absolute inset-0 opacity-20">
                      <img
                        src={settings.heroSection.customImageUrl}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 glass-effect rounded-2xl flex items-center justify-center mb-6">
                      <IconComponent size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                      {card.title}
                    </h1>
                    <p className="text-white/80 text-lg mb-8 max-w-md">
                      {card.subtitle}
                    </p>
                  </div>
                  <Link 
                    to="/register" 
                    className="btn-glass self-start font-semibold px-8 py-4 text-lg relative z-10"
                  >
                    {card.cta}
                  </Link>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={card.id}
                className="hero-card app-card cursor-pointer"
                variants={cardVariants}
                custom={index}
                onClick={card.action}
              >
                <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center mb-4">
                  <IconComponent size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-text-secondary text-sm">
                  {card.subtitle}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Custom Image Section */}
        {settings?.heroSection?.additionalImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-16"
          >
            <div className="app-surface rounded-3xl p-8 border border-app-border overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-text-primary mb-4">
                    {settings.heroSection.additionalTitle || 'Transform Your Property Management'}
                  </h2>
                  <p className="text-text-secondary text-lg mb-6">
                    {settings.heroSection.additionalDescription || 'Experience the future of property management with our comprehensive platform designed for modern landlords and property managers.'}
                  </p>
                  <Link 
                    to="/register" 
                    className="btn-gradient px-8 py-4 rounded-2xl font-semibold inline-flex items-center gap-2"
                  >
                    Get Started Today
                  </Link>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="relative rounded-3xl overflow-hidden shadow-app-xl">
                    <img
                      src={settings.heroSection.additionalImageUrl}
                      alt="Property Management Platform"
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;