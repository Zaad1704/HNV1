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
      title: settings?.heroSection?.title || 'Modern Property Management',
      subtitle: settings?.heroSection?.subtitle || 'Streamline your property management with our all-in-one platform',
      isMain: true,
      cta: settings?.heroSection?.ctaText || 'Get Started',
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
                  className="hero-card gradient-card md:col-span-2 md:row-span-2 flex flex-col justify-between min-h-[300px]"
                  variants={cardVariants}
                  custom={index}
                >
                  <div>
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
                    className="btn-glass self-start font-semibold px-8 py-4 text-lg"
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
      </div>
    </section>
  );
};

export default HeroSection;