// frontend/src/pages/LandingPage.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useMediaQuery } from '../hooks/useMediaQuery';
import axios from 'axios';

// Import all the section components
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import InstallAppSection from '../components/landing/InstallAppSection';
import ContactSection from '../components/landing/ContactSection';
import LeadershipSection from '../components/landing/LeadershipSection';

const LandingPage = () => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [error, setError] = useState<string | null>(null);
    const { data: settings, isLoading, error: settingsError } = useSiteSettings({
        retry: 3,
        retryDelay: 1000,
        onError: (err) => {
            console.error('Settings fetch error:', err);
            setError('Failed to load settings. Please try again later.');
        }
    });

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
                    <Link 
                        to="/register" 
                        className="btn-light font-bold py-3 px-6 rounded-lg mt-8 self-start text-sm hover:scale-105 transition-transform"
                    >
                        {settings?.heroSection?.ctaText || t('landing.hero_cta')}
                    </Link>
                </>
            ),
        },
        // Rest of your card positions...
    ];

    // Error UI
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-primary"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            className="min-h-screen bg-light-bg dark:bg-dark-bg"
        >
            {/* Main Hero Section with Scattered Cards */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <div className="hero-card-container">
                        {cardPositions.map((card, index) => (
                            <motion.div
                                key={index}
                                className={`hero-card ${card.className}`}
                                variants={cardVariants}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ 
                                    scale: 1.05, 
                                    boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                                    transition: { duration: 0.2 } 
                                }}
                            >
                                {card.content}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            {sections.map((section) => (
                <div 
                    key={section.id}
                    id={section.id}
                    className={`py-24 ${
                        section.type === 'default' 
                            ? 'bg-light-card dark:bg-dark-card' 
                            : section.type === 'gradient-primary'
                            ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white'
                            : 'bg-gradient-to-br from-brand-secondary to-brand-primary text-white'
                    }`}
                >
                    {section.id === 'about' && <AboutSection />}
                    {section.id === 'services' && <ServicesSection />}
                    {section.id === 'pricing' && <PricingSection />}
                    {section.id === 'leadership' && <LeadershipSection />}
                </div>
            ))}

            {/* InstallAppSection and ContactSection */}
            <div id="install-app" className="py-24 container mx-auto px-6">
                <InstallAppSection />
            </div>
            <div id="contact" className="py-24 bg-light-card dark:bg-dark-card">
                <ContactSection />
            </div>
        </motion.div>
    );
};

export default LandingPage;
