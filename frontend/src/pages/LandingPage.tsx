// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { CheckCircle, ArrowRight } from 'lucide-react';

const FullPageLoader = () => <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Page...</div>;

// A reusable component for the background effect
const BlurredBackgroundSection = ({ children, bgImageUrl, id }) => (
    <section id={id} className="relative py-20 md:py-32 overflow-hidden text-white">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 z-0">
            <img src={bgImageUrl} alt="" className="w-full h-full object-cover filter blur-sm scale-105" />
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6">
            {children}
        </div>
    </section>
);

const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic !== false));
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
            }
        };
        fetchPlans();
    }, []);

    if (isLoading || isError || !settings) {
        return <FullPageLoader />;
    }

    return (
        <div>
            {/* --- HERO SECTION --- */}
            <BlurredBackgroundSection id="hero" bgImageUrl={settings.heroSection?.backgroundImageUrl}>
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-300">{settings.heroSection?.subtitle}</p>
                    <Link to="/register" className="mt-10 inline-block bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400">
                        {settings.heroSection?.ctaText}
                    </Link>
                </div>
            </BlurredBackgroundSection>

            {/* --- FEATURES SECTION --- */}
            <BlurredBackgroundSection id="features" bgImageUrl={settings.aboutPage?.imageUrl}>
                 <div className="text-center">
                    <h2 className="text-4xl font-bold">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features.map((feature, index) => (
                            <div key={index} className="bg-slate-800/50 p-8 rounded-xl backdrop-blur-sm border border-white/10">
                                <h3 className="text-2xl font-bold text-cyan-400 mb-2">{feature.title}</h3>
                                <p className="text-slate-300">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </BlurredBackgroundSection>
            
            {/* --- ABOUT SECTION --- */}
            <BlurredBackgroundSection id="about" bgImageUrl={settings.aboutPage?.imageUrl}>
                 {/* Content for About section can be built here using settings.aboutPage */}
            </BlurredBackgroundSection>

            {/* --- PRICING SECTION --- */}
            <BlurredBackgroundSection id="pricing" bgImageUrl={settings.ctaSection?.backgroundImageUrl}>
                <div className="text-center">
                    <h2 className="text-4xl font-bold">{settings.pricingSection?.title}</h2>
                    <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{settings.pricingSection?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map(plan => (
                            <div key={plan._id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 flex flex-col text-left">
                                <h3 className="text-2xl font-bold text-yellow-400">{plan.name}</h3>
                                <p className="text-4xl font-extrabold mt-4">${(plan.price / 100).toFixed(2)}<span className="text-base font-medium text-slate-400"> / {plan.duration}</span></p>
                                <ul className="space-y-3 mt-8 text-slate-300">
                                    {plan.features.map((feature: string) => (
                                        <li key={feature} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /><span>{feature}</span></li>
                                    ))}
                                </ul>
                                <div className="flex-grow"></div>
                                <Link to={`/register?plan=${plan._id}`} className="mt-8 block w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 text-center">Choose Plan</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </BlurredBackgroundSection>

            {/* --- CONTACT SECTION --- */}
            <BlurredBackgroundSection id="contact" bgImageUrl={settings.heroSection?.backgroundImageUrl}>
                 {/* Content for Contact section can be built here using settings.contactPage */}
            </BlurredBackgroundSection>
        </div>
    );
};

export default LandingPage;
