import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import PricingSection from '../components/landing/PricingSection';
import LeadershipSection from '../components/landing/LeadershipSection';
import ContactSection from '../components/landing/ContactSection';
import ServicesSection from '../components/landing/ServicesSection';
import InstallAppSection from '../components/landing/InstallAppSection';

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
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
    <div className="min-h-screen bg-app-bg dark:bg-dark-bg">
      <HeroSection />
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