// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { CheckCircle, DownloadCloud } from 'lucide-react';

const FullPageLoader = () => <div className="min-h-screen bg-light-bg flex items-center justify-center text-dark-text">Loading...</div>;

const Section = ({ id, children, className = '' }) => (
    <section id={id} className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="container mx-auto">
            {children}
        </div>
    </section>
);

const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic !== false));
            } catch (error) { console.error("Failed to fetch pricing plans:", error); }
        };
        fetchPlans();

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        (installPrompt as any).prompt();
    };

    if (isLoading || isError || !settings) return <FullPageLoader />;

    return (
        <div className="bg-light-bg text-dark-text">
            {/* Hero Section */}
            <Section id="hero" className="bg-light-card text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg text-light-text">{settings.heroSection?.subtitle}</p>
                <Link to="/register" className="mt-10 inline-block bg-brand-orange text-white font-bold py-4 px-10 rounded-lg text-lg hover:opacity-90 transition-opacity">
                    {settings.heroSection?.ctaText}
                </Link>
            </Section>

            {/* Features Section */}
            <Section id="features">
                 <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features.map((feature, index) => (
                            <div key={index} className="bg-light-card p-8 rounded-xl border border-border-color shadow-sm">
                                <h3 className="text-xl font-bold text-dark-text mb-2">{feature.title}</h3>
                                <p className="text-light-text">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
            
            {/* Pricing Section */}
            <Section id="pricing" className="bg-light-card">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">{settings.pricingSection?.title}</h2>
                    <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.pricingSection?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map(plan => (
                            <div key={plan._id} className="bg-white border border-border-color rounded-2xl p-8 flex flex-col text-left shadow-lg">
                                <h
