// frontend/src/pages/LandingPage.tsx
import React from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { usePublicPlans } from '../hooks/usePublicPlans'; // Assuming this hook exists to fetch plans
import PublicHeader from '../components/layout/PublicHeader';
import Footer from '../components/layout/Footer';
import PublicBottomNavBar from '../components/layout/PublicBottomNavBar';
import Spinner from '../components/uikit/Spinner';

// Import Section Components
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import PricingSection from '../components/landing/PricingSection';
import InstallAppSection from '../components/landing/InstallAppSection';
import ContactSection from '../components/landing/ContactSection';

const LandingPage = () => {
    const { data: settings, isLoading: isLoadingSettings } = useSiteSettings();
    // NOTE: I've assumed a `usePublicPlans` hook exists to fetch pricing plans for the landing page.
    const { data: plans, isLoading: isLoadingPlans } = usePublicPlans(); 

    if (isLoadingSettings || isLoadingPlans) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-light-bg dark:bg-dark-bg">
                <Spinner />
            </div>
        );
    }

    if (!settings) {
        return <div className="text-center p-8 text-red-500">Error: Could not load site configuration.</div>;
    }

    return (
        <div className="bg-light-bg dark:bg-dark-bg">
            <PublicHeader />
            <main>
                <HeroSection settings={settings.heroSection} />
                <FeaturesSection settings={settings.featuresPage} />
                <AboutSection settings={settings.aboutSection} />
                <ServicesSection settings={settings.servicesSection} />
                <PricingSection plans={plans || []} settings={settings.pricingSection} />
                <InstallAppSection settings={settings.installAppSection} />
                <ContactSection settings={settings.contactSection} />
            </main>
            <Footer />
            <PublicBottomNavBar />
        </div>
    );
};

export default LandingPage;
