import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { useWindowSize } from '../hooks/useWindowSize';
import {
    ChevronRight, Home, ShieldCheck, Briefcase,
    DownloadCloud, CheckCircle, Star
} from 'lucide-react';

// --- (1) HELPER HOOK & COMPONENTS ---

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
        <DesktopSection id="hero" className="text-white text-center !py-40" style={{ background: 'linear-gradient(135deg, #3D52A0, #7091E6)'}}>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">{settings.heroSection?.title}</h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-indigo-200">{settings.heroSection?.subtitle}</p>
            <Link to="/register" className="mt-10 inline-block bg-white text-brand-dark font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-200 shadow-xl transition-all transform hover:scale-105">
                {settings.heroSection?.ctaText}
            </Link>
        </DesktopSection>

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

        {/* About Section - ADDED */}
        <DesktopSection id="aboutPage" className="bg-brand-bg/80">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-dark-text">{settings.aboutPage?.title}</h2>
                <p className="text-light-text mt-4 max-w-2xl mx-auto">{settings.aboutPage?.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                <div className="bg-light-card p-10 rounded-2xl shadow-lg border border-border-color">
                    <h3 className="text-2xl font-bold text-brand-dark mb-4">{settings.aboutPage?.missionTitle}</h3>
                    <p className="mb-8 text-light-text leading-relaxed">{settings.aboutPage?.missionStatement}</p>
                    <h3 className="text-2xl font-bold text-brand-dark mb-4">{settings.aboutPage?.visionTitle}</h3>
                    <p className="text-light-text leading-relaxed">{settings.aboutPage?.visionStatement}</p>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img src={settings.aboutPage?.imageUrl} alt="About Us" className="w-full h-auto object-cover"/>
                </div>
            </div>
        </DesktopSection>

        {/* Pricing Section - ADDED */}
        <DesktopSection id="pricingSection">
             <div className="text-center">
                <h2 className="text-4xl font-bold text-dark-text">{settings?.pricingSection?.title}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings?.pricingSection?.subtitle}</p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map(plan => (
                        <div key={plan._id} className="bg-light-card border border-border-color rounded-2xl p-8 text-left flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all">
                           <h3 className="text-2xl font-bold text-brand-dark">{plan.name}</h3>
                           <p className="mt-4 text-4xl font-extrabold text-dark-text">
                               {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
                               {plan.price > 0 && <span className="text-base font-medium text-light-text"> / {plan.duration}</span>}
                           </p>
                           <ul className="space-y-3 mt-8 flex-grow text-light-text">
                               {plan.features.map(feature => ( <li key={feature} className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" /><span>{feature}</span></li> ))}
                           </ul>
                           <Link to={`/register?plan=${plan._id}`} className="block w-full text-center bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors mt-8">Choose Plan</Link>
                        </div>
                    ))}
                </div>
            </div>
        </DesktopSection>
        
        {/* Install App Section - ADDED */}
        <DesktopSection id="installAppSection" className="bg-brand-bg/80">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-dark-text">{settings?.installAppSection?.title}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings?.installAppSection?.subtitle}</p>
                <button className="mt-10 inline-flex items-center gap-3 bg-brand-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-brand-dark shadow-xl transition-transform transform hover:scale-105">
                    <DownloadCloud /> Install App
                </button>
            </div>
        </DesktopSection>

        {/* Contact Section - ADDED */}
        <DesktopSection id="contact">
            {/* Contact Section implementation would go here */}
        </DesktopSection>
    </div>
);


// --- (3 & 4) MOBILE LAYOUT & MAIN COMPONENT ---
// ... (These parts remain the same as the previous turn)
const MobileLayout = ({ settings, plans }) => { /* ... */ };

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

    if (width < 768) {
        return <MobileLayout settings={settings} plans={plans} />;
    }

    return <DesktopLayout settings={settings} plans={plans} />;
};

export default LandingPage;
