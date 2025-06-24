import React from 'react';
import { ISiteSettings } from '../../types/siteSettings'; // Using local types
import AboutSection from '../landing/AboutSection';
import ServicesSection from '../landing/ServicesSection';
import PricingSection from '../landing/PricingSection';
import InstallAppSection from '../landing/InstallAppSection';
import ContactSection from '../landing/ContactSection';
import { Home, ShieldCheck, Briefcase, Star, Wrench, CreditCard, Users, Mail, Bolt, MapPin, Layers, Settings, Globe, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Icon mapping for features, ensuring it's consistent with the desktop layout
const FeatureIconMap: { [key: string]: React.ElementType } = {
    "briefcase": Briefcase, "lock": Lock, "shield-check": ShieldCheck, "home": Home,
    "users": Users, "credit-card": CreditCard, "wrench": Wrench, "mail": Mail,
    "bolt": Bolt, "map-pin": MapPin, "layers": Layers, "settings": Settings, "globe": Globe,
};

const getFeatureIconComponent = (iconName: string): React.ElementType => {
    return FeatureIconMap[iconName.toLowerCase()] || Star;
};

const MobileLandingLayout: React.FC<{ settings: ISiteSettings; plans: any[] }> = ({ settings, plans }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-brand-bg text-dark-text pb-16">
            {/* Hero Section */}
            <section id="hero" className="p-4 py-8 text-center" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="bg-black/60 backdrop-blur-sm p-6 rounded-xl text-center text-white">
                    <h2 className="text-2xl font-extrabold">{t('hero.title')}</h2>
                    <p className="mt-2 text-sm text-indigo-200">{t('hero.subtitle')}</p>
                </div>
            </section>

            {/* Features Section */}
            <section id="featuresPage" className="grid grid-cols-2 gap-4 p-4 text-center text-xs">
                {settings.featuresPage?.features?.slice(0, 4).map((feature, index) => {
                    const IconComponent = getFeatureIconComponent(feature.icon);
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
            
            {/* Other Sections */}
            <AboutSection />
            <ServicesSection />
            <PricingSection plans={plans} />
            <InstallAppSection />
            <ContactSection />
        </div>
    );
};

export default MobileLandingLayout;
