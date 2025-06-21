// frontend/src/components/layout/MobileLandingLayout.tsx
// This component now focuses on structuring the content sections for mobile,
// assuming the main navigation is provided by PublicBottomNavBar.

import React from 'react';
import { ISiteSettings } from '../../../../backend/models/SiteSettings';
import AboutSection from '../landing/AboutSection';
import ServicesSection from '../landing/ServicesSection';
import LeadershipSection from '../landing/LeadershipSection';
import PricingSection from '../landing/PricingSection';
import InstallAppSection from '../landing/InstallAppSection';
import ContactSection from '../landing/ContactSection';
// Import all necessary Lucide icons statically
import { Home, ShieldCheck, Briefcase, Star, Wrench, CreditCard, Users, Mail } from 'lucide-react'; // Added more icons based on common features

interface MobileLandingLayoutProps {
    settings: ISiteSettings;
    plans: any[];
}

// Map feature titles to Lucide icons
const FeatureIconMap: { [key: string]: React.ElementType } = {
    "Centralized Dashboard": Home,
    "Secure Document Storage": ShieldCheck,
    "Audit Trails & Security": Briefcase,
    // Add other feature titles from your settings and map them to their respective icons
    // Example from settings.featuresPage?.features:
    // { icon: 'briefcase', title: 'Centralized Dashboard', text: '...' },
    // You might need to map 'briefcase' to Briefcase, 'lock' to Lock, 'shield-check' to ShieldCheck, etc.
    // For now, mapping based on titles in the example translation.json
    "Tenant Management": Users, // From ServicesSection examples
    "Property Tracking": Home, // From ServicesSection examples
    "Rent Collection": CreditCard, // From ServicesSection examples
};

// Helper to get the correct icon component
const getFeatureIconComponent = (title: string): React.ElementType => {
    return FeatureIconMap[title] || Star; // Fallback to Star if no specific icon is mapped
};


const MobileLandingLayout: React.FC<MobileLandingLayoutProps> = ({ settings, plans }) => {
    return (
        <div className="bg-brand-bg text-dark-text pb-16"> {/* Add padding-bottom for fixed bottom nav */}
            {/* Mobile Hero Section - Simplified to just content, assuming Navbar/BottomNav handle CTA */}
            <section id="hero" className="p-4 py-8 text-center" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-black/50 p-4 rounded-xl text-center text-white">
                    <h2 className="text-2xl font-extrabold">{settings.heroSection?.title}</h2>
                    <p className="mt-2 text-sm">{settings.heroSection?.subtitle}</p>
                </div>
            </section>

            {/* Mobile Features Grid - Simplified, links can go to detailed features page or just scroll */}
            <section id="featuresPage" className="grid grid-cols-2 gap-4 p-4 text-center text-xs">
                {/* Ensure settings.featuresPage.features exists before mapping */}
                {settings.featuresPage?.features?.slice(0, 4).map((feature, index) => { // Display first 4 features as examples
                    const IconComponent = getFeatureIconComponent(feature.title);
                    return (
                        <div key={index} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-light-card border border-border-color shadow-sm">
                            <div className="w-12 h-12 flex items-center justify-center bg-brand-primary/10 text-brand-primary rounded-full mb-2">
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-dark-text">{feature.title}</span>
                            <span className="text-light-text text-xs line-clamp-2">{feature.text}</span>
                        </div>
                    );
                })}
            </section>
            
            {/* All other sections */}
            <section id="aboutPage" className="py-8">
                <div className="container mx-auto px-6">
                    <AboutSection />
                </div>
            </section>

            <section id="services" className="py-8 bg-gray-100">
                <div className="container mx-auto px-6">
                    <ServicesSection />
                </div>
            </section>

            <section id="leadership" className="py-8">
                <div className="container mx-auto px-6">
                    <LeadershipSection />
                </div>
            </section>

            <section id="pricingSection" className="py-8 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <PricingSection plans={plans} />
                </div>
            </section>

            <section id="installAppSection" className="py-8 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <InstallAppSection />
                </div>
            </section>

            <section id="contact" className="py-8 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <ContactSection />
                </div>
            </section>
        </div>
    );
};

export default MobileLandingLayout;
