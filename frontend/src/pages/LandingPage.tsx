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
    <div className="bg-light-bg dark:bg-dark-bg transition-colors duration-300"> {/* Main background color, added dark mode and transition */}
      <HeroSection />

      {/* Each section has a distinct background color from your palette */}
      <div id="about" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg transition-colors duration-300"> {/* Added dark mode and transition */}
        <AboutSection />
      </div>

      {/* FIX: Re-added LeadershipSection to make it visible */}
      <div id="leadership" className="py-20 md:py-28 bg-brand-subtle dark:bg-dark-card transition-colors duration-300"> {/* Mapped to new palette and added transition */}
        <LeadershipSection />
      </div>

      <div id="featuresPage" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg transition-colors duration-300"> {/* Mapped to new palette and added transition */}
        {/* You can create a FeaturesSection component here if needed */}
        {/* For now, we are focusing on the main structure */}
      </div>

      <div id="pricingSection" className="py-20 md:py-28 bg-light-card dark:bg-dark-bg transition-colors duration-300"> {/* Mapped to new palette and added transition */}
        <PricingSection />
      </div>
      
      <div id="installApp" className="py-20 md:py-28 bg-brand-subtle dark:bg-dark-card transition-colors duration-300"> {/* Mapped to new palette and added transition */}
        <InstallAppSection />
      </div>

      <div id="contact" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg transition-colors duration-300"> {/* Mapped to new palette and added transition */}
        <ContactSection />
      </div>
    </div>
  );
};

export default LandingPage;
