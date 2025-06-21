import React from 'react';
import { Link } from 'react-router-dom';
import { ISiteSettings } from '../../../../backend/models/SiteSettings'; // Adjust path if needed
// Import all your common landing page section components
import HeroSection from '../landing/HeroSection'; // Can be adapted or replaced
import AboutSection from '../landing/AboutSection'; // Will need internal mobile adaptation
import ServicesSection from '../landing/ServicesSection'; // Will need internal mobile adaptation
import LeadershipSection from '../landing/LeadershipSection'; // Will need internal mobile adaptation
import PricingSection from '../landing/PricingSection'; // Will need internal mobile adaptation
import InstallAppSection from '../landing/InstallAppSection'; // Will need internal mobile adaptation
import ContactSection from '../landing/ContactSection'; // Will need internal mobile adaptation
import { Home, ShieldCheck, Briefcase, Star } from 'lucide-react'; // Example icons needed for features section

interface MobileLandingLayoutProps {
    settings: ISiteSettings;
    plans: any[]; // Assuming plans type is `any[]`
}

// Re-defining IconMap and getFeatureIcon if they are used directly in this layout for features
const IconMap = { "Centralized Dashboard": Home, "Secure Document Storage": ShieldCheck, "Audit Trails & Security": Briefcase };
const getFeatureIcon = (title: string) => (IconMap as any)[title] || Star; // Casting to any for dynamic lookup

const MobileLandingLayout: React.FC<MobileLandingLayoutProps> = ({ settings, plans }) => {
    return (
        <div className="bg-brand-bg text-dark-text">
            {/* Mobile Hero Section - Using direct content as per your original MobileLayout */}
            <div className="p-4">
                 <div className="relative h-48 bg-cover bg-center rounded-xl overflow-hidden my-2 shadow-lg" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`}}>
                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
                        <h2 className="text-2xl font-extrabold">{settings.heroSection?.title}</h2>
                        <Link to="/register" className="mt-4 inline-flex items-center gap-2 bg-white text-brand-dark font-bold py-2 px-5 text-sm rounded-lg shadow-xl">{settings.heroSection?.ctaText}</Link>
                    </div>
                </div>
            </div>

            {/* Mobile Features Grid - Icons with short labels (from your original MobileLayout) */}
            <div className="grid grid-cols-4 gap-2 p-2 text-center text-xs">
                {settings.featuresPage?.features?.slice(0, 4).map(feature => {
                    const Icon = getFeatureIcon(feature.title); // Use helper function for icons
                    return (
                        <Link to="/#featuresPage" key={feature.title} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-brand-primary/10">
                            <div className="w-14 h-14 flex items-center justify-center bg-brand-primary/10 text-brand-primary rounded-full">
                                <Icon className="w-7 h-7" />
                            </div>
                            <span className="font-medium text-dark-text">{feature.title}</span>
                        </Link>
                    );
                })}
            </div>
            
            {/* INTEGRATED: About Section - You might need to adapt its content/layout internally for mobile */}
            {/* Example: A dedicated MobileAboutSection component, or pass a 'mobile' prop to the existing one */}
            <section id="aboutPage" className="py-8">
                <div className="container mx-auto px-6">
                    {/* Assuming AboutSection can adapt or you create a specific MobileAboutSection */}
                    <AboutSection /> 
                    {/* You could add a specific mobile-only section title here if AboutSection itself doesn't adapt it */}
                    {/* <h2 className="text-2xl font-bold text-dark-text text-center mb-4">{settings.aboutPage?.title}</h2> */}
                </div>
            </section>

            {/* INTEGRATED: Services Section - Adapt for mobile display */}
            <section id="services" className="py-8 bg-gray-100"> {/* Added some light background for visual separation */}
                <div className="container mx-auto px-6">
                    <ServicesSection /> 
                </div>
            </section>

            {/* INTEGRATED: Leadership Section - Adapt for mobile display */}
            <section id="leadership" className="py-8">
                <div className="container mx-auto px-6">
                    <LeadershipSection /> 
                </div>
            </section>

            {/* INTEGRATED: Pricing Section - Adapt for mobile display (e.g., stacked cards, simpler) */}
            <section id="pricingSection" className="py-8 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <PricingSection plans={plans} /> 
                </div>
            </section>

            {/* INTEGRATED: Install App Section - Adapt for mobile display */}
            <section id="installAppSection" className="py-8 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <InstallAppSection />
                </div>
            </section>

            {/* INTEGRATED: Contact Section - Adapt for mobile display (e.g., stacked form and addresses) */}
            <section id="contact" className="py-8 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <ContactSection />
                </div>
            </section>
        </div>
    );
};

export default MobileLandingLayout;
