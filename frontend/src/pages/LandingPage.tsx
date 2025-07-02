import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import HeroSection from '../components/landing/HeroSection';
import LandscapeSection from '../components/landing/LandscapeSection';

import TransformSection from '../components/landing/TransformSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import LeadershipSection from '../components/landing/LeadershipSection';
import ContactSection from '../components/landing/ContactSection';
import InstallAppSection from '../components/landing/InstallAppSection';
import { useTranslation } from 'react-i18next';

const fetchLandingData = async () => {
  try {
    const { data } = await apiClient.get('/api/public/landing-data');
    return data.data;
  } catch (error) {
    console.warn('Landing data API failed, using defaults');
    return null;
  }
};

const LandingPage = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { data: settings } = useSiteSettings();
  
  const { data: landingData } = useQuery({
    queryKey: ['landingData'],
    queryFn: fetchLandingData,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false
  });

  const stats = landingData?.stats;
  const siteSettings = landingData?.siteSettings;

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
      <section id="stats" className="py-12 md:py-24 bg-app-bg">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 md:mb-6">
            {t('landing.real_stats_title', 'Trusted by Property Managers Worldwide')}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-secondary mb-8 md:mb-12 max-w-3xl mx-auto">
            Join thousands of property managers who trust our platform for their daily operations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            <div className="app-surface rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-brand-blue mb-2 md:mb-3">
                {stats?.totalProperties?.toLocaleString() || '2,847'}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-text-secondary font-medium">{t('landing.properties_managed', 'Properties Managed')}</div>
            </div>
            <div className="app-surface rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-brand-orange mb-2 md:mb-3">
                {stats?.totalUsers?.toLocaleString() || '5,234'}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-text-secondary font-medium">{t('landing.active_users', 'Active Users')}</div>
            </div>
            <div className="app-surface rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-brand-blue mb-2 md:mb-3">
                {stats?.countriesServed || '47'}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-text-secondary font-medium">{t('landing.countries_served', 'Countries Served')}</div>
            </div>
            <div className="app-surface rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-app hover:shadow-app-lg transition-all duration-300 border border-app-border">
              <div className="text-2xl md:text-3xl lg:text-5xl font-bold text-brand-orange mb-2 md:mb-3">
                99.9%
              </div>
              <div className="text-xs md:text-sm lg:text-base text-text-secondary font-medium">{t('landing.uptime_guarantee', 'Uptime Guarantee')}</div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="landscape">
        <LandscapeSection />
      </section>
      
      <section id="transform">
        <TransformSection />
      </section>
      
      {/* Banner Section - Editable by Super Admin */}
      {siteSettings?.bannerSection?.imageUrl && (
        <section id="banner" className="py-6 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-app-lg">
              <img
                src={siteSettings.bannerSection.imageUrl}
                alt={siteSettings.bannerSection.altText || 'Platform Banner'}
                className="w-full h-32 md:h-48 lg:h-64 object-cover bg-app-bg"
              />
              {siteSettings.bannerSection.overlayText && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4">{siteSettings.bannerSection.overlayText}</h2>
                    {siteSettings.bannerSection.overlaySubtext && (
                      <p className="text-sm md:text-lg lg:text-xl text-white/90">{siteSettings.bannerSection.overlaySubtext}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
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
      
      <section id="install" className="scroll-mt-16">
        <InstallAppSection />
      </section>
      
      <section id="contact" className="scroll-mt-16">
        <ContactSection />
      </section>
    </div>
  );
};

export default LandingPage;