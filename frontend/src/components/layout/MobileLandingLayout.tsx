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
// Import all necessary Lucide icons statically that you might use
import { Home, ShieldCheck, Briefcase, Star, Users, CreditCard, Mail, Bolt, MapPin, Layers, Settings, Globe } from 'lucide-react';

interface MobileLandingLayoutProps {
    settings: ISiteSettings;
    plans: any[];
}

// Map feature titles/icon names (from SiteSettings) to Lucide icon components
const FeatureIconMap: { [key: string]: React.ElementType } = {
    // Icons explicitly used in SiteSettings (from backend/models/SiteSettings.ts defaults)
    "briefcase": Briefcase, // for 'Centralized Dashboard'
    "lock": ShieldCheck, // for 'Secure Document Storage' (if used directly as 'lock')
    "shield-check": ShieldCheck, // for 'Audit Trails & Security' (if used directly as 'shield-check')
    
    // Icons from ServicesSection examples or other common features
    "Tenant Management": Users,
    "Property Tracking": Home,
    "Rent Collection": CreditCard,

    // Add more mappings if 'feature.icon' in SiteSettings uses different strings
    // e.g., if settings.featuresPage.features[x].icon is "home", map "home": Home
    "Home": Home,
    "Users": Users,
    "DollarSign": CreditCard,
    "Wrench": Wrench,
    "Building": Building, // Assuming Building is also used
    "Phone": Mail, // Placeholder for phone icon if needed
    "MapPin": MapPin, // Placeholder for map pin icon if needed
    "Layers": Layers, // Placeholder for layers icon if needed
    "Settings": Settings, // Placeholder for settings icon if needed
    "Globe": Globe, // Placeholder for globe icon if needed
    "Bolt": Bolt // Example for a bolt icon
};

// Helper to get the correct icon component, gracefully handling missing ones
const getFeatureIconComponent = (iconName: string): React.ElementType => {
    // Try to find by direct name (e.g., "Home") or by mapped title
    return FeatureIconMap[iconName] || FeatureIconMap[iconName.toLowerCase()] || Star; // Fallback to Star
};

const MobileLandingLayout: React.FC<MobileLandingLayoutProps> = ({ settings, plans }) => {
    return (
        <div className="bg-brand-bg text-dark-text pb-16"> {/* Add padding-bottom for fixed bottom nav */}
            <section id="hero" className="p-4 py-8 text-center" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-black/50 p-4 rounded-xl text-center text-white">
                    <h2 className="text-2xl font-extrabold">{settings.heroSection?.title}</h2>
                    <p className="mt-2 text-sm">{settings.heroSection?.subtitle}</p>
                </div>
            </section>

            <section id="featuresPage" className="grid grid-cols-2 gap-4 p-4 text-center text-xs">
                {settings.featuresPage?.features?.slice(0, 4).map((feature, index) => { // Display first 4 features as examples
                    const IconComponent = getFeatureIconComponent(feature.icon); // Use feature.icon string directly
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
