import React from 'react';
import { Link } from 'react-router-dom';
import { ISiteSettings } from '../../../../backend/models/SiteSettings'; // Adjust path if needed
import { Home, ShieldCheck, Briefcase, Star } from 'lucide-react'; // Example icons

interface MobileLandingLayoutProps {
    settings: ISiteSettings;
    plans: any[]; // Assuming plans type is `any[]`
}

const IconMap = { "Centralized Dashboard": Home, "Secure Document Storage": ShieldCheck, "Audit Trails & Security": Briefcase };
const getFeatureIcon = (title: string) => (IconMap as any)[title] || Star; // Casting to any for dynamic lookup

const MobileLandingLayout: React.FC<MobileLandingLayoutProps> = ({ settings, plans }) => {
    return (
        <div className="bg-brand-bg text-dark-text">
            {/* Mobile Hero Section - Simplified and prominent CTA */}
            <div className="p-4">
                 <div className="relative h-48 bg-cover bg-center rounded-xl overflow-hidden my-2 shadow-lg" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`}}>
                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
                        <h2 className="text-2xl font-extrabold">{settings.heroSection?.title}</h2>
                        <Link to="/register" className="mt-4 inline-flex items-center gap-2 bg-white text-brand-dark font-bold py-2 px-5 text-sm rounded-lg shadow-xl">{settings.heroSection?.ctaText}</Link>
                    </div>
                </div>
            </div>

            {/* Mobile Features Grid - Icons with short labels */}
            <div className="grid grid-cols-4 gap-2 p-2 text-center text-xs">
                {settings.featuresPage?.features?.slice(0, 4).map(feature => {
                    const Icon = getFeatureIcon(feature.title);
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
            {/* You might want a full FeaturesPage component for mobile that loads on click,
                or a simplified one directly here for detailed view. */}
            <section id="featuresPage" className="py-8">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-dark-text mb-4">{settings.featuresPage?.title}</h2>
                    {/* Simplified list of features, potentially with accordions for details */}
                </div>
            </section>

            {/* Other Mobile Sections (simplified versions of their desktop counterparts) */}
            {/* You would create separate mobile-optimized versions of AboutSection, ServicesSection, etc.
                or adapt the existing ones to be very concise for mobile. */}
            {/* For example, a mobile-specific AboutSection could have just the Mission/Vision text without the image. */}
            {/* This is where you would place them, tailored for mobile. */}
            {/* <MobileAboutSection /> */}
            {/* <MobileServicesSection /> */}
            {/* <MobilePricingSection plans={plans} /> */}
            {/* <MobileInstallAppSection /> */}
            {/* <MobileContactSection /> */}
            
            {/* Placeholder for other sections */}
            <div className="container mx-auto px-6 py-8">
                <h3 className="text-xl font-bold text-dark-text mb-4">More Sections for Mobile</h3>
                <p className="text-light-text">
                    This is where you would include mobile-optimized versions of About, Services, Pricing, etc.
                    They would be condensed and touch-friendly.
                </p>
            </div>
        </div>
    );
};

export default MobileLandingLayout;
