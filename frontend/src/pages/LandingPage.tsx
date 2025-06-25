// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useSiteSettings } from '../hooks/useSiteSettings'; // Import useSiteSettings

// Import all the section components
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import InstallAppSection from '../components/landing/InstallAppSection'; // Import InstallAppSection
import ContactSection from '../components/landing/ContactSection';
import LeadershipSection from '../components/landing/LeadershipSection';

const LandingPage = () => {
    const { t } = useTranslation();
    const { data: settings } = useSiteSettings();

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: "easeOut",
          },
        }),
    };

    // Updated sections for the new scattered layout, removed install app as a card
    const sections = [
        { id: 'about', titleKey: 'header.about', description: t('about.subtitle'), type: 'default' },
        { id: 'services', titleKey: 'header.services', description: t('services.subtitle'), type: 'gradient-primary' },
        { id: 'pricing', titleKey: 'header.pricing', description: t('pricing.subtitle'), type: 'default' },
        { id: 'leadership', titleKey: 'header.leadership', description: t('leadership.subtitle'), type: 'gradient-secondary' },
    ];

    const cardPositions = [
        // Main card (Welcome) - Centered, larger
        {
            className: "card-main gradient-primary text-white flex flex-col justify-between items-start",
            content: (
                <>
                    <div>
                        <div className="w-12 h-12 bg-white/25 rounded-full mb-4"></div>
                        <h1 className="text-5xl font-bold leading-tight">
                            {settings?.heroSection?.title || t('landing.hero_title')}
                        </h1>
                        <p className="text-white/80 mt-4 text-lg">
                            {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
                        </p>
                    </div>
                    <Link to="/register" className="btn-light font-bold py-3 px-6 rounded-lg mt-8 self-start text-sm">
                        {settings?.heroSection?.ctaText || t('landing.hero_cta')}
                    </Link>
                </>
            ),
        },
        // Smaller card - Top left
        {
            className: "card-small-1 neutral-glass flex flex-col justify-center items-center text-center",
            content: (
                <>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {t('dashboard.properties')}
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Manage your properties with ease.</p>
                </>
            ),
        },
        // Medium card - Top right
        {
            className: "card-medium-1 neutral-glass flex flex-col justify-end items-end text-right",
            content: (
                <>
                    <h2 className="text-2xl font-bold text-gray-800">{t('dashboard.tenants')}</h2>
                    <p className="text-gray-500 text-sm mt-2">Keep track of all your tenants.</p>
                    <Link to="/login" className="btn-dark font-semibold py-2 px-5 rounded-lg mt-4 self-end text-sm">
                        {t('header.login')}
                    </Link>
                </>
            ),
        },
        // Another small card - Bottom left
        {
            className: "card-small-2 gradient-secondary text-white flex flex-col justify-start items-start",
            content: (
                <>
                    <div className="w-10 h-10 bg-white/25 rounded-full mb-3"></div>
                    <h2 className="text-xl font-bold">{t('dashboard.payments')}</h2>
                    <p className="text-white/80 text-sm mt-1">Track all your rent payments.</p>
                </>
            ),
        },
        // Another medium card - Bottom right
        {
            className: "card-medium-2 neutral-glass flex flex-col justify-center items-center text-center",
            content: (
                <>
                    <h2 className="text-3xl font-extrabold gradient-text">
                        HNV
                    </h2>
                    <p className="text-gray-500 text-sm mt-2">Solutions</p>
                </>
            ),
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
        >
            {/* Main Hero Section with Scattered Cards */}
            <section className="py-24 bg-light-bg dark:bg-dark-bg relative overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    {/* The hero text is now part of the main card, not directly here */}
                </div>

                <div className="hero-card-container">
                    {cardPositions.map((card, index) => (
                        <motion.div
                            key={index}
                            className={`hero-card ${card.className}`}
                            variants={cardVariants}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
                        >
                            {card.content}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Content Sections */}
            <div id="about" className="py-24 bg-light-card dark:bg-dark-card"><AboutSection /></div>
            <div id="services" className="py-24 bg-light-bg dark:bg-dark-bg"><ServicesSection /></div>
            <div id="pricing" className="py-24 bg-light-card dark:bg-dark-card"><PricingSection /></div>
            <div id="leadership" className="py-24 bg-light-bg dark:bg-dark-bg"><LeadershipSection /></div>
            {/* InstallAppSection rendered directly, not as a card */}
            <div id="install-app" className="py-24 container mx-auto px-6">
                <InstallAppSection />
            </div>
            <div id="contact" className="py-24 bg-light-card dark:bg-dark-card"><ContactSection /></div>
        </motion.div>
    );
};

export default LandingPage;
