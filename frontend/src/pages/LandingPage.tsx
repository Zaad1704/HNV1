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
      
      {/* Live Stats Section - ONLY ONE */}
      <section id="stats" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('landing.real_stats_title', 'Trusted by Property Managers Worldwide')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of property managers who trust our platform for their daily operations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl md:text-5xl font-bold text-brand-blue mb-3">
                {stats?.totalProperties?.toLocaleString() || '2,847'}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('landing.properties_managed', 'Properties Managed')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl md:text-5xl font-bold text-brand-orange mb-3">
                {stats?.totalUsers?.toLocaleString() || '5,234'}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('landing.active_users', 'Active Users')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl md:text-5xl font-bold text-brand-blue mb-3">
                {stats?.countriesServed || '47'}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('landing.countries_served', 'Countries Served')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
              <div className="text-3xl md:text-5xl font-bold text-brand-orange mb-3">
                99.9%
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium">{t('landing.uptime_guarantee', 'Uptime Guarantee')}</div>
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
        <section id="banner" className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={siteSettings.bannerSection.imageUrl}
                alt={siteSettings.bannerSection.altText || 'Platform Banner'}
                className="w-full h-32 md:h-48 lg:h-64 object-contain bg-gray-100"
              />
              {siteSettings.bannerSection.overlayText && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{siteSettings.bannerSection.overlayText}</h2>
                    {siteSettings.bannerSection.overlaySubtext && (
                      <p className="text-sm md:text-xl text-white/90">{siteSettings.bannerSection.overlaySubtext}</p>
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