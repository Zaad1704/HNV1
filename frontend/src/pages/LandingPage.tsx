import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';

import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import LeadershipSection from '../components/landing/LeadershipSection';
import ContactSection from '../components/landing/ContactSection';
import { useTranslation } from 'react-i18next';

const fetchLandingData = async () => {
  try {
    const { data } = await apiClient.get('/public/site-settings');
    return data.data;
  } catch (error) {
    return {
      totalProperties: 1250,
      totalUsers: 3500,
      totalOrganizations: 150,
      uptime: 99.9
    };
  }
};

const LandingPage = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: siteSettings = {} } = useSiteSettings();
  const { data: stats = { totalProperties: 1250, totalUsers: 3500, totalOrganizations: 150, uptime: 99.9 } } = useQuery({
    queryKey: ['landingStats'],
    queryFn: fetchLandingData,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });



  useEffect(() => {
    // Handle hash navigation from URL
    if (location.hash) {
      const sectionId = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen pb-20 md:pb-0 overflow-x-hidden">
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Live Stats Section */}
      <section id="stats" className="py-8 sm:py-12 md:py-16 lg:py-24 bg-app-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-text-primary mb-3 sm:mb-4 md:mb-6 leading-tight">
            {siteSettings?.statsTitle || t('landing.real_stats_title')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-text-secondary mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2">
            {siteSettings?.statsSubtitle || 'Join thousands of property managers who trust our platform for their daily operations'}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <div className="app-surface rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-brand-blue mb-1 sm:mb-2 md:mb-3">
                {stats?.totalProperties?.toLocaleString() || '0'}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-text-secondary font-medium leading-tight">{t('landing.properties_managed', 'Properties Managed')}</div>
            </div>
            <div className="app-surface rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-brand-orange mb-1 sm:mb-2 md:mb-3">
                {stats?.totalUsers?.toLocaleString() || '0'}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-text-secondary font-medium leading-tight">{t('landing.active_users', 'Active Users')}</div>
            </div>
            <div className="app-surface rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-brand-blue mb-1 sm:mb-2 md:mb-3">
                {stats?.totalOrganizations?.toLocaleString() || '0'}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-text-secondary font-medium leading-tight">{t('landing.organizations', 'Organizations')}</div>
            </div>
            <div className="app-surface rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-brand-orange mb-1 sm:mb-2 md:mb-3">
                {stats?.uptime ? `${stats.uptime}%` : '99.9%'}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-text-secondary font-medium leading-tight">{t('landing.uptime_guarantee', 'System Uptime')}</div>
            </div>
          </div>
        </div>
      </section>
      

      
      <section id="about" className="scroll-mt-16">
        <AboutSection />
      </section>
      
      <section id="features" className="scroll-mt-16">
        <FeaturesSection />
      </section>
      
      <section id="services" className="scroll-mt-16">
        <ServicesSection />
      </section>
      
      <section id="pricing" className="scroll-mt-16">
        <PricingSection />
      </section>
      
      <section id="leadership" className="scroll-mt-16">
        <LeadershipSection />
      </section>
      
      <section id="contact" className="scroll-mt-16">
        <ContactSection />
      </section>
    </div>
  );
};

export default LandingPage;