// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { CheckCircle, DownloadCloud } from 'lucide-react';

const FullPageLoader = () => <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

const BlurredBackgroundSection = ({ id, children, className = '' }) => {
    const { data: settings } = useSiteSettings();
    const sectionKey = id.endsWith('Section') ? id : `${id}Section`;
    const bgImageUrl = settings?.[sectionKey]?.backgroundImageUrl;

    return (
        <section id={id} className={`relative py-20 md:py-28 overflow-hidden text-white bg-slate-900 ${className}`}>
            <div className="absolute inset-0 z-0">
                {bgImageUrl && <img src={bgImageUrl} alt="background" className="w-full h-full object-cover filter blur-sm scale-105" />}
                <div className="absolute inset-0 bg-slate-900/80"></div>
            </div>
            <div className="relative z-10 container mx-auto px-6">
                {children}
            </div>
        </section>
    );
};


const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic !== false));
            } catch (error) { console.error("Failed to fetch pricing plans:", error); }
        };
        fetchPlans();
    }, []);

    if (isLoading || isError || !settings) return <FullPageLoader />;

    return (
        <div className="bg-slate-900">
            <BlurredBackgroundSection id="heroSection">
                <div className="text-center py-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-300">{settings.heroSection?.subtitle}</p>
                    <Link to="/register" className="mt-10 inline-block bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400">
                        {settings.heroSection?.ctaText}
                    </Link>
                </div>
            </BlurredBackgroundSection>

            <BlurredBackgroundSection id="featuresPage">
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
            
            <BlurredBackgroundSection id="aboutPage">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold">{settings.aboutPage?.title}</h2>
                    <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{settings.aboutPage?.subtitle}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700">
                        <h3 className="text-2xl font-bold text-pink-400 mb-4">{settings.aboutPage?.missionTitle}</h3>
                        <p className="mb-8 text-slate-300 leading-relaxed">{settings.aboutPage?.missionStatement}</p>
                        <h3 className="text-2xl font-bold text-pink-400 mb-4">{settings.aboutPage?.visionTitle}</h3>
                        <p className="text-slate-300 leading-relaxed">{settings.aboutPage?.visionStatement}</p>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-xl">
                        <img src={settings.aboutPage?.imageUrl} alt="About Us" className="w-full h-auto object-cover"/>
                    </div>
                </div>
            </BlurredBackgroundSection>
        </div>
    );
};

export default LandingPage;
