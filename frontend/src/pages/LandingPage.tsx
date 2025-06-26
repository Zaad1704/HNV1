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

      {/* Each section can be further customized to match the Yartee glassmorphism style */}
      <div id="features" className="py-20 md:py-28">
        {/* Placeholder for a features section if needed */}
      </div>

      <div id="about" className="py-20 md:py-28">
        <AboutSection />
      </div>
      
      <div id="pricing" className="py-20 md:py-28">
        <PricingSection />
      </div>

      <div id="contact" className="py-20 md:py-28">
        <ContactSection />
      </div>
    </motion.div>
  );
};

export default LandingPage;
