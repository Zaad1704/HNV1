import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Building2, Users, CreditCard, BarChart3, Settings, ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-app-bg overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-brand-blue/5"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-brand-orange/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="/logo-min.png" 
                alt="HNV Logo" 
                className="w-16 h-16 object-contain"
              />
              <div className="text-2xl font-bold gradient-dark-orange-blue bg-clip-text text-transparent">
                {settings?.logos?.companyName || 'HNV Property Management'}
              </div>
            </div>
            <h1 className="text-6xl font-bold text-text-primary mb-6 leading-tight">
              {settings?.heroSection?.title || t('landing.hero_title')}
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
            </p>
            <div className="flex gap-4">
              <Link 
                to="/register" 
                className="gradient-dark-orange-blue text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
              >
                {settings?.heroSection?.ctaText || t('landing.hero_cta')}
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-app-border text-text-primary hover:bg-app-surface transition-all"
              >
                <Play size={20} />
                Learn More
              </button>
            </div>
          </motion.div>

          {/* Right Content - Custom Image or Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {settings?.heroSection?.customImageUrl ? (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={settings.heroSection.customImageUrl}
                  alt="Property Management Platform"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, title: 'Properties', color: 'gradient-dark-orange-blue' },
                  { icon: Users, title: 'Tenants', color: 'gradient-orange-blue' },
                  { icon: CreditCard, title: 'Payments', color: 'gradient-dark-orange-blue' },
                  { icon: BarChart3, title: 'Analytics', color: 'gradient-orange-blue' }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="app-surface p-6 rounded-2xl border border-app-border hover:shadow-app-lg transition-all cursor-pointer"
                    onClick={() => scrollToSection('about')}
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                      <item.icon size={24} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile Layout - Native App Style */}
        <div className="md:hidden text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo for Mobile */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/logo-min.png" 
                alt="HNV Logo" 
                className="w-12 h-12 object-contain"
              />
              <div className="text-xl font-bold gradient-dark-orange-blue bg-clip-text text-transparent">
                {settings?.logos?.companyName || 'HNV'}
              </div>
            </div>
            
            {/* Custom Image for Mobile */}
            {settings?.heroSection?.customImageUrl && (
              <div className="mb-8 mx-auto w-64 h-64 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={settings.heroSection.customImageUrl}
                  alt="Property Management"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl font-bold text-text-primary mb-4 leading-tight px-4">
              {settings?.heroSection?.title || t('landing.hero_title')}
            </h1>
            <p className="text-lg text-text-secondary mb-8 px-6 leading-relaxed">
              {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
            </p>

            {/* Mobile CTA Buttons */}
            <div className="space-y-4 px-6">
              <Link 
                to="/register" 
                className="w-full gradient-dark-orange-blue text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                {settings?.heroSection?.ctaText || t('landing.hero_cta')}
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-app-border text-text-primary bg-app-surface/50 backdrop-blur-sm"
              >
                <Play size={20} />
                Learn More
              </button>
            </div>

            {/* Mobile Feature Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-2 gap-4 px-6"
            >
              {[
                { icon: Building2, title: 'Properties', count: '500+' },
                { icon: Users, title: 'Tenants', count: '2K+' },
                { icon: CreditCard, title: 'Payments', count: '$1M+' },
                { icon: BarChart3, title: 'Reports', count: '24/7' }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="app-surface p-4 rounded-2xl border border-app-border text-center"
                >
                  <item.icon size={24} className="text-brand-orange mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-primary">{item.count}</p>
                  <p className="text-xs text-text-secondary">{item.title}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Additional Custom Image Section */}
        {settings?.heroSection?.additionalImageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20"
          >
            <div className="app-surface rounded-3xl p-8 border border-app-border overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-text-primary mb-4">
                    {settings.heroSection.additionalTitle || 'Transform Your Property Management'}
                  </h2>
                  <p className="text-text-secondary text-lg mb-6">
                    {settings.heroSection.additionalDescription || 'Experience the future of property management with our comprehensive platform.'}
                  </p>
                  <Link 
                    to="/register" 
                    className="gradient-dark-orange-blue text-white px-8 py-4 rounded-2xl font-semibold inline-flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Get Started Today
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={settings.heroSection.additionalImageUrl}
                      alt="Property Management Features"
                      className="w-full h-auto object-cover"
                    />
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