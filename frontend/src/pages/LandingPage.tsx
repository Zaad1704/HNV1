import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useWindowSize } from '../hooks/useWindowSize';
import { CheckCircle, Briefcase, Lock, ShieldCheck, Home, Users, CreditCard, Wrench, Star, DownloadCloud } from 'lucide-react';
import PricingSection from '../components/landing/PricingSection';
import ContactSection from '../components/landing/ContactSection';
import AboutSection from '../components/landing/AboutSection';
import InstallAppSection from '../components/landing/InstallAppSection';

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

const LandingPage = () => {
    const { t } = useTranslation();
    const { data: settings, isLoading } = useSiteSettings();
    const { width } = useWindowSize();

    if (isLoading || !settings) {
        return (
            <div className="min-h-screen bg-brand-bg flex items-center justify-center text-dark-text">
                <p>Loading HNV Property Management Solutions...</p>
            </div>
        );
    }

    return (
        <div className="bg-brand-bg text-dark-text">
            {/* Hero Section */}
            <section id="hero" className="text-white text-center py-20 md:py-40" style={{ background: `linear-gradient(135deg, rgba(61, 82, 160, 0.9), rgba(112, 145, 230, 0.8)), url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{t('landing.hero_title')}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-200">{t('landing.hero_subtitle')}</p>
                    <Link to="/register" className="mt-10 inline-block bg-white text-brand-dark font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 shadow-xl transition-all transform hover:scale-105">
                        {t('landing.hero_cta')}
                    </Link>
                </div>
            </section>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
                {/* Features Section */}
                <section id="featuresPage">
                    <div className="text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-dark-text">{settings.featuresPage?.title}</h2>
                        <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features?.map((feature, index) => {
                            const IconComponent = getFeatureIconComponent(feature.icon);
                            return (
                                <div key={index} className="bg-light-card p-8 rounded-2xl border border-border-color shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all">
                                    <div className="text-brand-primary mb-4">
                                        <IconComponent className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-brand-dark mb-2">{feature.title}</h3>
                                    <p className="text-light-text">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Other Sections are now imported components */}
                <AboutSection />
                <PricingSection />
                <InstallAppSection />
                <ContactSection />
            </main>
        </div>
    );
};

export default LandingPage;
