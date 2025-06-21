// frontend/src/pages/LandingPage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import PricingSection from '../components/landing/PricingSection';
import InstallAppSection from '../components/landing/InstallAppSection';
import ContactSection from '../components/landing/ContactSection';

const FullPageLoader = () => <div className="min-h-screen bg-primary flex items-center justify-center text-white">Loading...</div>;

const BlurredBackgroundSection = ({ id, children, className = '' }) => {
    const { data: settings } = useSiteSettings();
    const sectionKey = id.endsWith('Section') ? id : `${id}Section`;
    const bgImageUrl = settings?.[sectionKey]?.backgroundImageUrl;

    return (
        <section id={id} className={`relative py-20 md:py-28 overflow-hidden ${className}`}>
            <div className="absolute inset-0 z-0">
                {bgImageUrl && <img src={bgImageUrl} alt="background" className="w-full h-full object-cover filter blur-sm scale-105" />}
                <div className="absolute inset-0 bg-light-bg/80 dark:bg-dark-bg/80"></div>
            </div>
            <div className="relative z-10 container mx-auto px-6">
                {children}
            </div>
        </section>
    );
};


const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();

    if (isLoading || isError || !settings) return <FullPageLoader />;

    return (
        <div className="bg-light-bg dark:bg-dark-bg">
            <BlurredBackgroundSection id="heroSection" className="text-center text-white">
                 <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary to-indigo-700"></div>
                 <div className="relative z-10 py-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-200">{settings.heroSection?.subtitle}</p>
                    <Link to="/register" className="mt-10 inline-block bg-accent text-primary-dark font-bold py-4 px-8 rounded-lg text-lg hover:bg-amber-400 shadow-xl transition-transform transform hover:scale-105">
                        {settings.heroSection?.ctaText}
                    </Link>
                </div>
            </BlurredBackgroundSection>

            <BlurredBackgroundSection id="featuresPage">
                 <div className="text-center">
                    <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features.map((feature, index) => (
                            <div key={index} className="bg-light-card/80 dark:bg-dark-card/80 p-8 rounded-xl backdrop-blur-sm border border-border-color dark:border-border-color-dark shadow-md">
                                <h3 className="text-2xl font-bold text-primary mb-2">{feature.title}</h3>
                                <p className="text-light-text">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </BlurredBackgroundSection>
            
            <BlurredBackgroundSection id="aboutPage">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings.aboutPage?.title}</h2>
                    <p className="text-light-text dark:text-light-text-dark mt-4 max-w-2xl mx-auto">{settings.aboutPage?.subtitle}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <div className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md p-8 rounded-2xl border border-border-color dark:border-border-color-dark shadow-md">
                        <h3 className="text-2xl font-bold text-primary mb-4">{settings.aboutPage?.missionTitle}</h3>
                        <p className="mb-8 text-light-text leading-relaxed">{settings.aboutPage?.missionStatement}</p>
                        <h3 className="text-2xl font-bold text-primary mb-4">{settings.aboutPage?.visionTitle}</h3>
                        <p className="text-light-text leading-relaxed">{settings.aboutPage?.visionStatement}</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                        <img src={settings.aboutPage?.imageUrl} alt="About Us" className="w-full h-auto object-cover"/>
                    </div>
                </div>
            </BlurredBackgroundSection>

            <PricingSection />
            <InstallAppSection />
            <ContactSection />
        </div>
    );
};

export default LandingPage;
