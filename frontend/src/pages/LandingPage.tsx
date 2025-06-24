import React from 'react';

// Import all the section components
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import LeadershipSection from '../components/landing/LeadershipSection';
import PricingSection from '../components/landing/PricingSection';
import ContactSection from '../components/landing/ContactSection';
import InstallAppSection from '../components/landing/InstallAppSection';

// This is the main component that builds your landing page
const LandingPage = () => {
  return (
    <div className="bg-brand-dark"> {/* Main background color */}
      <HeroSection />

      {/* Each section has a distinct background color from your palette */}
      <div id="about" className="py-20 md:py-28 bg-brand-dark">
        <AboutSection />
      </div>

      {/* FIX: Re-added LeadershipSection to make it visible */}
      <div id="leadership" className="py-20 md:py-28 bg-brand-secondary">
        <LeadershipSection />
      </div>

      <div id="featuresPage" className="py-20 md:py-28 bg-brand-secondary">
        {/* You can create a FeaturesSection component here if needed */}
        {/* For now, we are focusing on the main structure */}
      </div>

      <div id="pricingSection" className="py-20 md:py-28 bg-brand-dark">
        <PricingSection />
      </div>
      
      <div id="installApp" className="py-20 md:py-28 bg-brand-secondary">
        <InstallAppSection />
      </div>

      <div id="contact" className="py-20 md:py-28 bg-brand-dark">
        <ContactSection />
      </div>
    </div>
  );
};

export default LandingPage;
