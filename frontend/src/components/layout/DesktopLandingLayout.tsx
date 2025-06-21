import React from 'react';
import { Link } from 'react-router-dom';
import { ISiteSettings } from '../../../../backend/models/SiteSettings'; // Correct path to backend types
// FIX: Adjusted import paths to be relative for all common landing page section components
import AboutSection from '../landing/AboutSection';
import ServicesSection from '../landing/ServicesSection';
import LeadershipSection from '../landing/LeadershipSection';
import PricingSection from '../landing/PricingSection'; 
import InstallAppSection from '../landing/InstallAppSection';
import ContactSection from '../landing/ContactSection';
import { Home, ShieldCheck, Briefcase, Star } from 'lucide-react'; 

interface DesktopLandingLayoutProps {
    settings: ISiteSettings;
    plans: any[]; 
}

const IconMap = { "Centralized Dashboard": Home, "Secure Document Storage": ShieldCheck, "Audit Trails & Security": Briefcase };
const getFeatureIcon = (title: string) => (IconMap as any)[title] || Star; 

const DesktopLandingLayout: React.FC<DesktopLandingLayoutProps> = ({ settings, plans }) => {
    return (
        <div className="bg-light-bg text-dark-text">
            {/* Desktop Hero Section */}
            <section id="hero" className="text-white text-center py-40" style={{ background: `linear-gradient(135deg, #3D52A0, #7091E6), url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{settings.heroSection?.title}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-200">{settings.heroSection?.subtitle}</p>
                    <Link to="/register" className="mt-10 inline-block bg-white text-brand-dark font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 shadow-xl transition-all transform hover:scale-105">
                        {settings.heroSection?.ctaText}
                    </Link>
                </div>
            </section>

            {/* Desktop Features Section */}
            <section id="featuresPage" className="py-20 md:py-28">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-dark-text">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features.map((feature) => {
                            const Icon = getFeatureIcon(feature.title); 
                            return (
                                <div key={feature.title} className="bg-light-card p-8 rounded-2xl border border-border-color shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all">
                                    <div className="text-brand-primary mb-4">
                                        <Icon className="w-12 h-12" /> 
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-dark mb-2">{feature.title}</h3>
                                    <p className="text-light-text">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FIX: Ensure About Section is wrapped with a section tag and has the correct ID */}
            {/* Note: AboutSection itself will also need its internal ID adjusted to 'aboutPage' for consistency */}
            <section id="aboutPage" className="py-16 md:py-24 bg-white">
                 <AboutSection />
            </section>

            {/* FIX: Ensure Services Section is wrapped with a section tag and has the correct ID */}
            <section id="services" className="py-16 md:py-24 bg-gray-100">
                <ServicesSection />
            </section>

            {/* FIX: Ensure Leadership Section is wrapped with a section tag and has the correct ID */}
            <section id="leadership" className="py-16 md:py-24 bg-white">
                <LeadershipSection />
            </section>

            {/* FIX: Ensure Pricing Section is wrapped with a section tag and has the correct ID */}
            <section id="pricingSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
                 <PricingSection plans={plans} />
            </section>

            {/* FIX: Ensure Install App Section is wrapped with a section tag and has the correct ID */}
            <section id="installAppSection" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <InstallAppSection />
                </div>
            </section>

            {/* FIX: Ensure Contact Section is wrapped with a section tag and has the correct ID */}
            <section id="contact" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg">
                <div className="container mx-auto px-6">
                    <ContactSection />
                </div>
            </section>
        </div>
    );
};

export default DesktopLandingLayout;
