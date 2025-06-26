// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';

// Import all the section components
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import LeadershipSection from '../components/landing/LeadershipSection';
import PricingSection from '../components/landing/PricingSection';
import ContactSection from '../components/landing/ContactSection';
import InstallAppSection from '../components/landing/InstallAppSection';

const LandingPage = () => {
    const pageVariants = {
        initial: { opacity: 0 },
        in: { opacity: 1 },
        out: { opacity: 0 },
    };

    const pageTransition = {
        type: "tween",
        ease: "anticipate",
        duration: 0.5,
    };

  return (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="bg-light-bg dark:bg-dark-bg transition-colors duration-300"
    >
      <HeroSection />

      {/* Features Section - This will be populated by DesktopLandingLayout/MobileLandingLayout */}
      {/* The actual content for this section is rendered by the layout components,
          but we keep the ID here for consistent scrolling targets. */}
      <div id="featuresPage" className="py-20 md:py-28">
        {/* Content will be injected by the layout components */}
      </div>

      <div id="about" className="py-20 md:py-28">
        <AboutSection />
      </div>
      
      <div id="services" className="py-20 md:py-28">
        <ServicesSection />
      </div>

      <div id="leadership" className="py-20 md:py-28">
        <LeadershipSection />
      </div>

      <div id="pricing" className="py-20 md:py-28">
        <PricingSection />
      </div>

      <div id="contact" className="py-20 md:py-28">
        <ContactSection />
      </div>

      <div id="install-app" className="py-20 md:py-28">
        <InstallAppSection />
      </div>
    </motion.div>
  );
};

export default LandingPage;
