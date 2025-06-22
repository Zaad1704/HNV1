import React from 'react';
import { Link } from 'react-router-dom';
import { ISiteSettings } from '../../../../backend/models/SiteSettings';
import AboutSection from '../landing/AboutSection';
import ServicesSection from '../landing/ServicesSection'; // Import
import LeadershipSection from '../landing/LeadershipSection'; // Import
import PricingSection from '../landing/PricingSection'; 
import InstallAppSection from '../landing/InstallAppSection'; // Import
import ContactSection from '../landing/ContactSection';
import { Home, ShieldCheck, Briefcase, Star, Lock, Wrench, Users, CreditCard } from 'lucide-react';

// ... IconMap and getFeatureIconComponent helpers remain the same ...

const DesktopLandingLayout: React.FC<{ settings: ISiteSettings, plans: any[] }> = ({ settings, plans }) => {
    return (
        <div className="bg-light-bg text-dark-text">
            {/* ... HeroSection and FeaturesPage sections remain the same ... */}

            <section id="aboutPage" className="py-16 md:py-24 bg-white">
                 <AboutSection />
            </section>
            
            {/* --- NEW SECTIONS ADDED --- */}
            <section id="servicesSection" className="py-16 md:py-24 bg-gray-100">
                <ServicesSection />
            </section>

            <section id="leadershipSection" className="py-16 md:py-24 bg-white">
                <LeadershipSection />
            </section>
            
            <section id="pricingSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
                 <PricingSection plans={plans} />
            </section>

            <section id="installAppSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <InstallAppSection />
                </div>
            </section>
            {/* --- END NEW SECTIONS --- */}

            <section id="contact" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <ContactSection />
                </div>
            </section>
        </div>
    );
};

export default DesktopLandingLayout;
