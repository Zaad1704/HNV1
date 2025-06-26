// frontend/src/components/layout/DesktopLandingLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ISiteSettings } from '../../types/siteSettings'; // Using local types
import AboutSection from '../landing/AboutSection';
import ServicesSection from '../landing/ServicesSection';
import PricingSection from '../landing/PricingSection'; 
import InstallAppSection from '../landing/InstallAppSection';
import ContactSection from '../landing/ContactSection';
import LeadershipSection from '../landing/LeadershipSection'; // Added LeadershipSection
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
            {/* Hero Section - Restored immersive design */}
            <section id="hero" className="relative text-center min-h-[90vh] flex items-center justify-center text-white" style={{ background: `url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="relative container mx-auto px-6 z-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">{t('hero.title')}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-white/90 drop-shadow-md">{t('hero.subtitle')}</p>
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
                    <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
                        {settings.featuresPage?.features?.map((feature, index) => {
                            const IconComponent = getFeatureIconComponent(feature.icon);
                            const rotations = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-3'];
                            const transformClass = rotations[index % rotations.length];
                            const isLinkable = !!feature.sectionId;

                            return (
                                <a
                                    key={index}
                                    href={isLinkable ? `#${feature.sectionId}` : undefined}
                                    onClick={isLinkable ? (e) => { e.preventDefault(); document.getElementById(feature.sectionId)?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
                                    className={`block bg-light-card dark:bg-dark-card p-8 rounded-2xl border border-border-color dark:border-border-color-dark shadow-lg transition-all duration-300 w-full md:w-1/3 lg:w-1/4 ${transformClass} ${isLinkable ? 'hover:shadow-xl hover:!rotate-0 hover:scale-110 cursor-pointer' : 'hover:scale-105'}`}
                                >
                                    <div className="text-brand-primary dark:text-brand-secondary mb-4 transition-colors">
                                        <IconComponent className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-2">{feature.title}</h3>
                                    <p className="text-light-text dark:text-light-text-dark">{feature.text}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Other Sections */}
            <AboutSection />
            <ServicesSection />
            <LeadershipSection /> {/* Added LeadershipSection */}
            <PricingSection plans={plans} />
            <InstallAppSection />
            <ContactSection />
        </div>
    );
};

export default DesktopLandingLayout;
