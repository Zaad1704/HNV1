import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import {
    ChevronRight, Home, ShieldCheck, Briefcase,
    DownloadCloud, ArrowRight, CheckCircle, Star
} from 'lucide-react';

// --- (1) HELPER HOOK & COMPONENTS ---

// Custom hook to get window dimensions
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}

const FullPageLoader = () => <div className="min-h-screen bg-brand-primary flex items-center justify-center text-white">Loading...</div>;

// Maps feature titles to icons for the mobile view
const IconMap = { "Centralized Dashboard": Home, "Secure Document Storage": ShieldCheck, "Audit Trails & Security": Briefcase };
const getFeatureIcon = (title) => IconMap[title] || Star;


// --- (2) DESKTOP LAYOUT & ITS SECTIONS ---

const DesktopSection = ({ id, children, className = '' }) => (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
        <div className="container mx-auto px-6">{children}</div>
    </section>
);

const DesktopLayout = ({ settings, plans }) => (
    <div className="bg-light-bg text-dark-text">
        {/* Hero Section */}
        <div className="relative text-white text-center py-40 px-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #3D52A0, #7091E6)'}}>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{settings.heroSection?.title}</h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-200">{settings.heroSection?.subtitle}</p>
            <Link to="/register" className="mt-10 inline-block bg-white text-brand-dark font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 shadow-xl transition-all transform hover:scale-105">
                {settings.heroSection?.ctaText}
            </Link>
        </div>

        {/* Features Section */}
        <DesktopSection id="featuresPage">
             <div className="text-center">
                <h2 className="text-4xl font-bold text-dark-text">{settings.featuresPage?.title}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {settings.featuresPage?.features.map((feature) => (
                        <div key={feature.title} className="bg-light-card p-8 rounded-2xl border border-border-color shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all">
                            <h3 className="text-2xl font-bold text-brand-dark mb-2">{feature.title}</h3>
                            <p className="text-light-text">{feature.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DesktopSection>
    </div>
);


// --- (3) MOBILE LAYOUT & ITS SECTIONS ---

const MobileLayout = ({ settings, plans }) => {
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleInstallPrompt = (e) => { e.preventDefault(); setInstallPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return; // Fail silently if no prompt is available
        installPrompt.prompt();
    };

    return (
        <div className="bg-brand-bg">
            {/* Top "Install" Banner */}
            <div className="flex items-center justify-between p-2 bg-light-card border-b border-border-color sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <img src={settings?.logos?.faviconUrl} alt="logo" className="h-8 w-8" />
                    <div>
                        <p className="font-bold text-sm text-brand-dark">Install the HNV App</p>
                        <p className="text-xs text-light-text">For a better experience</p>
                    </div>
                </div>
                <button onClick={handleInstallClick} className="bg-brand-primary text-white font-bold text-sm py-2 px-4 rounded-lg shadow-md hover:bg-brand-dark">Install</button>
            </div>

            {/* Hero Banner */}
            <div className="p-2">
                 <div className="relative h-48 bg-cover bg-center rounded-lg overflow-hidden my-2 shadow-lg" style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})`}}>
                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
                        <h2 className="text-2xl font-extrabold">{settings.heroSection?.title}</h2>
                        <Link to="/register" className="mt-4 inline-flex items-center gap-2 bg-white text-brand-dark font-bold py-2 px-5 text-sm rounded-lg shadow-xl">{settings.heroSection?.ctaText}</Link>
                    </div>
                </div>
            </div>

            {/* Quick Links Icon Grid */}
            <div className="grid grid-cols-4 gap-2 p-2 text-center text-xs">
                {settings.featuresPage?.features?.slice(0, 4).map(feature => {
                    const Icon = getFeatureIcon(feature.title);
                    return (<Link to="/#featuresPage" key={feature.title} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-brand-primary/10">
                        <div className="w-14 h-14 flex items-center justify-center bg-brand-primary/10 text-brand-primary rounded-full"><Icon className="w-7 h-7" /></div>
                        <span className="font-medium text-dark-text">{feature.title}</span>
                    </Link>);
                })}
            </div>

            {/* Card Section for Pricing */}
            <div className="my-4">
                <div className="flex justify-between items-center px-4 mb-2">
                    <h3 className="text-lg font-bold text-dark-text">Choose Your Plan</h3>
                    <Link to="/#pricingSection" className="flex items-center text-sm font-semibold text-brand-primary">View All <ChevronRight size={16} /></Link>
                </div>
                <div className="flex gap-3 overflow-x-auto p-4 -mt-2">
                    {plans.map(plan => (
                        <div key={plan._id} className="flex-shrink-0 w-40 bg-light-card rounded-lg shadow-md p-2 border border-border-color">
                           <div className="w-full h-20 bg-brand-bg rounded-md flex items-center justify-center"><p className="text-brand-primary font-bold">{plan.name}</p></div>
                           <h4 className="font-bold text-dark-text mt-2 truncate text-sm">{plan.name}</h4>
                           <p className="text-md font-bold text-brand-primary">${(plan.price / 100).toFixed(2)}</p>
                           <p className="text-xs text-light-text line-through">${(plan.price / 100 * 1.5).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- (4) MAIN PAGE COMPONENT ---
//     (Decides which layout to show)
//
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

    const isMobile = width < 768;

    if (isMobile) {
        return <MobileLayout settings={settings} plans={plans} />;
    }

    return <DesktopLayout settings={settings} plans={plans} />;
};

export default LandingPage;
