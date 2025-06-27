import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import LeadershipSection from '../components/landing/LeadershipSection';
import ContactSection from '../components/landing/ContactSection';
import InstallAppSection from '../components/landing/InstallAppSection';
import { useTranslation } from 'react-i18next';

const fetchLandingStats = async () => {
  const { data } = await apiClient.get('/dashboard/landing-stats');
  return data.data;
};

const LandingPage = () => {
  const location = useLocation();
  const { t } = useTranslation();
  
  const { data: stats } = useQuery({
    queryKey: ['landingStats'],
    queryFn: fetchLandingStats,
    staleTime: 5 * 60 * 1000 // 5 minutes
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
    <div className="min-h-screen">
      <HeroSection />
      
      {/* Real Stats Section */}
      {stats && (
        <section className="py-20 bg-app-bg">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              {t('landing.real_stats_title')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="app-surface rounded-3xl p-6 border border-app-border">
                <div className="text-4xl font-bold text-brand-blue mb-2">
                  {stats.totalProperties?.toLocaleString() || '2,500+'}
                </div>
                <div className="text-text-secondary">{t('landing.properties_managed')}</div>
              </div>
              <div className="app-surface rounded-3xl p-6 border border-app-border">
                <div className="text-4xl font-bold text-brand-orange mb-2">
                  {stats.totalUsers?.toLocaleString() || '5,000+'}
                </div>
                <div className="text-text-secondary">{t('landing.active_users')}</div>
              </div>
              <div className="app-surface rounded-3xl p-6 border border-app-border">
                <div className="text-4xl font-bold text-brand-blue mb-2">
                  {stats.countriesServed || '25+'}
                </div>
                <div className="text-text-secondary">{t('landing.countries_served')}</div>
              </div>
              <div className="app-surface rounded-3xl p-6 border border-app-border">
                <div className="text-4xl font-bold text-brand-orange mb-2">
                  99.9%
                </div>
                <div className="text-text-secondary">{t('landing.uptime_guarantee')}</div>
              </div>
            </div>
          </div>
        </section>
      )}
      
      <AboutSection />
      <FeaturesSection />
      <ServicesSection />
      <PricingSection />
      <LeadershipSection />
      <InstallAppSection />
      <ContactSection />
    </div>
  );
};

export default LandingPage;