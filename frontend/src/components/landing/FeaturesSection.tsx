// frontend/src/components/landing/FeaturesSection.tsx
import React from 'react';
import { IFeaturesPage } from '../../types/siteSettings'; // Assuming type exists
import { Home, ShieldCheck, Briefcase, Star, Wrench, CreditCard, Users, Mail, Bolt, MapPin, Layers, Settings, Globe, Lock } from 'lucide-react';

const FeatureIconMap: { [key: string]: React.ElementType } = {
    "briefcase": Briefcase, "lock": Lock, "shield-check": ShieldCheck, "home": Home,
    "users": Users, "credit-card": CreditCard, "wrench": Wrench, "mail": Mail,
    "bolt": Bolt, "map-pin": MapPin, "layers": Layers, "settings": Settings, "globe": Globe,
};

const getFeatureIconComponent = (iconName: string): React.ElementType => {
    return FeatureIconMap[iconName?.toLowerCase()] || Star;
};

const FeaturesSection: React.FC<{ settings?: IFeaturesPage }> = ({ settings }) => {
    
    const features = settings?.features || [
        { icon: 'home', title: 'Property Management', text: 'Centralize all your property information.', sectionId: 'services' },
        { icon: 'users', title: 'Tenant Portal', text: 'Give tenants access to their lease and payment history.', sectionId: 'services' },
        { icon: 'credit-card', title: 'Online Payments', text: 'Collect rent and fees securely online.', sectionId: 'pricing' },
        { icon: 'wrench', title: 'Maintenance Tracking', text: 'Manage work orders from start to finish.', sectionId: 'services' },
    ];

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, sectionId?: string) => {
        if (sectionId) {
            e.preventDefault();
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="features" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-text dark:text-dark-text-dark">
                        {settings?.title || "Powerful Features for Modern Management"}
                    </h2>
                    <p className="mt-4 text-lg text-light-text dark:text-light-text-dark max-w-2xl mx-auto">
                        {settings?.subtitle || "Everything you need to streamline your operations and grow your business."}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const IconComponent = getFeatureIconComponent(feature.icon);
                        return (
                            <a key={index} href={`#${feature.sectionId}`} onClick={(e) => handleScroll(e, feature.sectionId)} className="block p-8 bg-light-card dark:bg-dark-card rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border-color dark:border-border-color-dark text-center">
                                <div className="w-16 h-16 flex items-center justify-center bg-brand-primary/10 dark:bg-brand-secondary/20 text-brand-primary dark:text-brand-secondary rounded-full mb-6 mx-auto">
                                    <IconComponent className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-dark-text dark:text-dark-text-dark mb-2">{feature.title}</h3>
                                <p className="text-light-text dark:text-light-text-dark">{feature.text}</p>
                            </a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
