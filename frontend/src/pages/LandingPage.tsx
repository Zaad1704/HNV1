import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { useWindowSize } from '../hooks/useWindowSize';
import {
    ChevronRight, Home, ShieldCheck, Briefcase,
    DownloadCloud, ArrowRight, CheckCircle
} from 'lucide-react';

const FullPageLoader = () => <div className="min-h-screen bg-primary flex items-center justify-center text-white">Loading...</div>;

// ===================================================================================
// 1. DESKTOP LAYOUT COMPONENTS
//    (Improved version of the original design with the new vibrant color palette)
// ===================================================================================

const DesktopSection = ({ id, children, className = '' }) => (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
        <div className="container mx-auto px-6">{children}</div>
    </section>
);

const DesktopLayout = ({ settings, plans }) => (
    <div className="bg-light-bg dark:bg-dark-bg text-dark-text dark:text-light-text-dark">
        {/* Hero Section */}
        <div className="relative text-white text-center py-40 px-6" style={{ background: 'linear-gradient(to right, #4f46e5, #6366f1)'}}>
            <h1 className="text-5xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-200">{settings.heroSection?.subtitle}</p>
            <Link to="/register" className="mt-10 inline-block bg-accent text-primary font-bold py-4 px-8 rounded-lg text-lg hover:bg-amber-400 shadow-xl transition-transform transform hover:scale-105">
                {settings.heroSection?.ctaText}
            </Link>
        </div>

        {/* Features Section */}
        <DesktopSection id="featuresPage">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings.featuresPage?.title}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {settings.featuresPage?.features.map((feature, index) => (
                        <div key={index} className="bg-light-card dark:bg-dark-card p-8 rounded-xl border border-border-color dark:border-border-color-dark shadow-md">
                            <h3 className="text-2xl font-bold text-primary mb-2">{feature.title}</h3>
                            <p className="text-light-text">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DesktopSection>
        
        {/* Pricing Section */}
        <DesktopSection id="pricingSection" className="bg-primary/5 dark:bg-dark-card/50">
             <div className="text-center">
                <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.pricingSection?.title}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings?.pricingSection?.subtitle}</p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map(plan => (
                        <div key={plan._id} className="bg-light-card dark:bg-dark-card border border-border-color dark:border-border-color-dark rounded-2xl p-8 text-left flex flex-col shadow-lg">
                           <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
                           <p className="mt-4 text-4xl font-extrabold text-dark-text dark:text-dark-text-dark">
                               {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
                               {plan.price > 0 && <span className="text-base font-medium text-light-text"> / {plan.duration}</span>}
                           </p>
                           <ul className="space-y-3 mt-8 flex-grow text-light-text">
                               {plan.features.map(feature => (
                                   <li key={feature} className="flex items-center"><CheckCircle className="w-5 h-5 text-success mr-3" /><span>{feature}</span></li>
                               ))}
                           </ul>
                           <Link to={`/register?plan=${plan._id}`} className="block w-full text-center bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-opacity mt-8">Choose Plan</Link>
                        </div>
                    ))}
                </div>
            </div>
        </DesktopSection>
        
        {/* Install and Contact can be added here in the same DesktopSection format */}

    </div>
);


// ===================================================================================
// 2. MOBILE LAYOUT COMPONENTS
//    (The new "Daraz-style" design)
// ===================================================================================

const IconMap = { "Centralized Dashboard": Home, "Secure Document Storage": ShieldCheck, "Audit Trails & Security": Briefcase };
const getFeatureIcon = (title) => IconMap[title] || Star;

const MobileLayout = ({ settings, plans }) => {
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleInstallPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) { return; }
        installPrompt.prompt();
    };

    return (
        <div className="bg-light-bg">
            {/* Top "Install" Banner */}
            <div className="flex items-center justify-between p-2 bg-light-card border-b border-border-color sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <img src={settings?.logos?.faviconUrl} alt="logo" className="h-8 w-8" />
                    <div>
                        <p className="font-bold text-sm text-dark-text">Install the HNV App</p>
                        <p className="text-xs text-light-text">For a better experience</p>
                    </div>
                </div>
                <button onClick={handleInstallClick} className="bg-primary text-white font-bold text-sm py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700">Install</button>
            </div>

            {/* Hero Banner */}
            <div className="p-2">
                 <div className="relative h-48 bg-cover bg-center rounded-lg overflow-hidden my-2 shadow-lg" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`}}>
                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
                        <h2 className="text-2xl font-extrabold">{settings.heroSection?.title}</h2>
                        <Link to="/register" className="mt-4 inline-flex items-center gap-2 bg-accent text-primary-dark font-bold py-2 px-5 text-sm rounded-lg shadow-xl">{settings.heroSection?.ctaText}</Link>
                    </div>
                </div>
            </div>

            {/* Quick Links Icon Grid */}
            <div className="grid grid-cols-4 gap-2 p-2 text-center text-xs">
                {settings.featuresPage?.features?.slice(0, 4).map(feature => {
                    const Icon = getFeatureIcon(feature.title);
                    return (<Link to="/#featuresPage" key={feature.title} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/10">
                        <div className="w-14 h-14 flex items-center justify-center bg-primary/10 text-primary rounded-full"><Icon className="w-7 h-7" /></div>
                        <span className="font-medium text-dark-text">{feature.title}</span>
                    </Link>);
                })}
            </div>

            {/* Card Section for Pricing */}
            <div className="my-4">
                <div className="flex justify-between items-center px-4 mb-2">
                    <h3 className="text-lg font-bold text-dark-text">Choose Your Plan</h3>
                    <Link to="/#pricingSection" className="flex items-center text-sm font-semibold text-primary">View All <ChevronRight size={16} /></Link>
                </div>
                <div className="flex gap-3 overflow-x-auto p-4 -mt-2">
                    {plans.map(plan => (
                        <div key={plan._id} className="flex-shrink-0 w-40 bg-light-card rounded-lg shadow-md p-2 border border-border-color">
                           <img src={`https://placehold.co/400x400/e0e7ff/4f46e5?text=${plan.name.charAt(0)}`} alt={plan.name} className="w-full h-20 object-cover rounded-md" />
                           <h4 className="font-bold text-dark-text mt-2 truncate text-sm">{plan.name}</h4>
                           <p className="text-md font-bold text-primary">${(plan.price / 100).toFixed(2)}</p>
                           <p className="text-xs text-light-text line-through">${(plan.price / 100 * 1.5).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ===================================================================================
// 3. MAIN COMPONENT
//    (Decides which layout to show based on screen size)
// ===================================================================================

const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [plans, setPlans] = useState<any[]>([]);
    const { width } = useWindowSize();

    useEffect(() => {
        apiClient.get('/plans').then(res => {
            setPlans(res.data.data.filter(p => p.isPublic));
        }).catch(err => console.error("Failed to fetch plans", err));
    }, []);

    if (isLoading || isError || !settings) {
        return <FullPageLoader />;
    }

    const isMobile = width < 768; // md breakpoint

    if (isMobile) {
        return <MobileLayout settings={settings} plans={plans} />;
    }

    return <DesktopLayout settings={settings} plans={plans} />;
};

export default LandingPage;
