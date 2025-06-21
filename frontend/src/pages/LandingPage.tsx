// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import {
    ChevronRight, Home, ShieldCheck, Briefcase, CreditCard,
    Star, MessageSquare, DownloadCloud, ArrowRight
} from 'lucide-react';

// --- Helper Icon Component ---
const IconMap = {
    "Centralized Dashboard": <Home className="w-8 h-8" />,
    "Secure Document Storage": <ShieldCheck className="w-8 h-8" />,
    "Audit Trails & Security": <Briefcase className="w-8 h-8" />,
    "Default": <Star className="w-8 h-8" />
};

const getFeatureIcon = (title: string) => IconMap[title] || IconMap["Default"];

// --- App Install Banner Component ---
const AppInstallBanner = () => {
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) {
            alert("To install, use your browser's 'Add to Home Screen' or 'Install App' feature.");
            return;
        }
        installPrompt.prompt();
    };

    return (
        <div className="flex items-center justify-between p-2 bg-light-card dark:bg-dark-card border-b border-border-color dark:border-border-color-dark">
            <div className="flex items-center gap-3">
                <DownloadCloud className="w-8 h-8 text-primary" />
                <div>
                    <p className="font-bold text-sm text-dark-text dark:text-dark-text-dark">Install the HNV App</p>
                    <p className="text-xs text-light-text">For a better experience</p>
                </div>
            </div>
            <button
                onClick={handleInstallClick}
                className="bg-primary text-white font-bold text-sm py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700"
            >
                Install
            </button>
        </div>
    );
};

// --- Hero Banner Component ---
const HeroBanner = ({ settings }) => (
    <div
        className="relative h-64 bg-cover bg-center rounded-lg overflow-hidden my-4 mx-2 shadow-lg"
        style={{ backgroundImage: `url(${settings.heroSection?.backgroundImageUrl})` }}
    >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
            <h1 className="text-3xl font-extrabold">{settings.heroSection?.title}</h1>
            <p className="text-sm mt-2">{settings.heroSection?.subtitle}</p>
            <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-2 bg-accent text-primary-dark font-bold py-2 px-5 rounded-lg shadow-xl"
            >
                {settings.heroSection?.ctaText} <ArrowRight size={16} />
            </Link>
        </div>
    </div>
);

// --- Quick Links Grid Component ---
const QuickLinksGrid = ({ settings }) => (
    <div className="grid grid-cols-4 gap-2 p-2 text-center text-xs">
        {settings.featuresPage?.features?.slice(0, 4).map(feature => (
            <Link to="/#featuresPage" key={feature.title} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-primary/10">
                <div className="w-16 h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                    {getFeatureIcon(feature.title)}
                </div>
                <span className="font-medium text-dark-text dark:text-light-text-dark">{feature.title}</span>
            </Link>
        ))}
    </div>
);

// --- Section Component with Cards ---
const CardSection = ({ title, link, children }) => (
    <div className="my-6">
        <div className="flex justify-between items-center px-4 mb-2">
            <h2 className="text-xl font-bold text-dark-text dark:text-dark-text-dark">{title}</h2>
            <Link to={link} className="flex items-center text-sm font-semibold text-primary">
                Shop More <ChevronRight size={16} />
            </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto p-4 -mt-2">
            {children}
        </div>
    </div>
);

// --- Main Landing Page ---
const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        apiClient.get('/plans').then(res => {
            setPlans(res.data.data.filter(p => p.isPublic));
        }).catch(err => console.error("Failed to fetch plans", err));
    }, []);

    if (isLoading || isError || !settings) {
        return <div className="min-h-screen bg-light-bg flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen">
            {/* These components are designed for mobile first */}
            <AppInstallBanner />
            <HeroBanner settings={settings} />
            <QuickLinksGrid settings={settings} />

            <CardSection title="Pricing Plans" link="/#pricingSection">
                {plans.map(plan => (
                    <div key={plan._id} className="flex-shrink-0 w-48 bg-light-card dark:bg-dark-card rounded-lg shadow-md p-3 border border-border-color dark:border-border-color-dark">
                        <div className="relative">
                            <img src={`https://placehold.co/400x400/e0e7ff/4f46e5?text=${plan.name.charAt(0)}`} alt={plan.name} className="w-full h-24 object-cover rounded-md" />
                            <div className="absolute top-1 right-1 bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                SAVE
                            </div>
                        </div>
                        <h3 className="font-bold text-dark-text dark:text-dark-text-dark mt-2 truncate">{plan.name}</h3>
                        <p className="text-lg font-bold text-primary">${(plan.price / 100).toFixed(2)}</p>
                        <p className="text-xs text-light-text line-through">${(plan.price / 100 * 1.5).toFixed(2)}</p>
                        <div className="w-full bg-red-100 rounded-full h-2 mt-2">
                            <div className="bg-danger h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                ))}
            </CardSection>

            {/* You can add more CardSection components here as needed */}

        </div>
    );
};

export default LandingPage;
