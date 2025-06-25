// frontend/src/components/layout/DesktopLandingLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ISiteSettings } from '../../types/siteSettings'; // Using local types
import AboutSection from '../landing/AboutSection';
import ServicesSection from '../landing/ServicesSection';
import PricingSection from '../landing/PricingSection'; 
import InstallAppSection from '../landing/InstallAppSection';
import ContactSection from '../landing/ContactSection';
import { Home, ShieldCheck, Briefcase, Star, Lock, Wrench, Users, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// This map allows the Super Admin to choose an icon by name in the Site Editor
const IconMap: { [key: string]: React.ElementType } = {
    "briefcase": Briefcase,
    "lock": Lock,
    "shield-check": ShieldCheck,
    "home": Home,
    "users": Users,
    "credit-card": CreditCard,
    "wrench": Wrench,
};

const getFeatureIconComponent = (iconName: string): React.ElementType => {
    return IconMap[iconName.toLowerCase()] || Star; // Fallback to a star icon
};

const DesktopLandingLayout: React.FC<{ settings: ISiteSettings; plans: any[] }> = ({ settings, plans }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
            {/* Hero Section */}
            <section id="hero" className="text-center py-40" style={{ background: `linear-gradient(135deg, var(--brand-dark), var(--brand-secondary)), url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}> {/* Adjusted gradient and text color */}
                <div className="container mx-auto px-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{t('hero.title')}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-light-text dark:text-light-text-dark">{t('hero.subtitle')}</p>
                    <Link to="/register" className="mt-10 inline-block bg-brand-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-brand-secondary shadow-xl transition-all transform hover:scale-105">
                        {t('hero.cta')}
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section id="featuresPage" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg transition-colors duration-300"> {/* Added dark mode */}
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features?.map((feature, index) => {
                            const IconComponent = getFeatureIconComponent(feature.icon);
                            return (
                                <div key={index} className="bg-light-card dark:bg-dark-card p-8 rounded-2xl border border-border-color dark:border-border-color-dark shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                    <div className="text-brand-primary dark:text-brand-secondary mb-4 transition-colors">
                                        <IconComponent className="w-12 h-12" /> 
                                    </div>
                                    <h3 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-2">{feature.title}</h3>
                                    <p className="text-light-text dark:text-light-text-dark">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Other Sections */}
            <AboutSection />
            <ServicesSection />
            <PricingSection plans={plans} />
            <InstallAppSection />
            <ContactSection />
        </div>
    );
};

export default DesktopLandingLayout;
