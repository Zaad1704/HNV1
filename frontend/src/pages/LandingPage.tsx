// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { CheckCircle, DownloadCloud } from 'lucide-react';

const FullPageLoader = () => <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

const BlurredBackgroundSection = ({ id, bgImageUrl, children, className = '' }) => (
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

const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
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
        <div>
            <BlurredBackgroundSection id="hero" bgImageUrl={settings.heroSection?.backgroundImageUrl}>
                <div className="text-center py-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold">{settings.heroSection?.title}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-300">{settings.heroSection?.subtitle}</p>
                    <Link to="/register" className="mt-10 inline-block bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400">
                        {settings.heroSection?.ctaText}
                    </Link>
                </div>
            </BlurredBackgroundSection>

            <BlurredBackgroundSection id="features" bgImageUrl={settings.featuresPage?.backgroundImageUrl}>
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
            
            <BlurredBackgroundSection id="about" bgImageUrl={settings.aboutPage?.backgroundImageUrl}>
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

            <BlurredBackgroundSection id="pricing" bgImageUrl={settings.pricingSection?.backgroundImageUrl}>
                <div className="text-center">
                    <h2 className="text-4xl font-bold">{settings.pricingSection?.title}</h2>
                    <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{settings.pricingSection?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {pricingPlans.map(plan => (
                            <div key={plan._id} className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 flex flex-col text-left">
                                <h3 className="text-2xl font-bold text-yellow-400">{plan.name}</h3>
                                <p className="text-4xl font-extrabold mt-4">${(plan.price / 100).toFixed(2)}<span className="text-base font-medium text-slate-400"> / {plan.duration}</span></p>
                                <ul className="space-y-3 mt-8 text-slate-300 flex-grow">
                                    {plan.features.map((feature: string) => (
                                        <li key={feature} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /><span>{feature}</span></li>
                                    ))}
                                </ul>
                                <Link to={`/register?plan=${plan._id}`} className="mt-8 block w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 text-center">Choose Plan</Link>
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-slate-500 mt-8">{settings.pricingSection?.disclaimer}</p>
                </div>
            </BlurredBackgroundSection>

            <BlurredBackgroundSection id="install-app" bgImageUrl={settings.installAppSection?.backgroundImageUrl}>
                <div className="text-center">
                    <DownloadCloud className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold">{settings.installAppSection?.title}</h2>
                    <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{settings.installAppSection?.subtitle}</p>
                    
                    {installPrompt ? (
                        <button 
                            onClick={handleInstallClick}
                            className="mt-10 inline-block bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400"
                        >
                            Install App Now
                        </button>
                    ) : (
                        <p className="mt-10 bg-slate-800/50 inline-block p-4 rounded-lg text-slate-400">
                            App already installed or browser not supported. <br/>(Try "Add to Home Screen" from your browser menu)
                        </p>
                    )}
                </div>
            </BlurredBackgroundSection>

            <footer id="contact" className="relative bg-slate-950 text-gray-300 py-16">
                 <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">{settings.contactPage?.title}</h2>
                        <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{settings.contactPage?.subtitle}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
                        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700">
                             <h3 className="text-2xl font-bold text-white mb-6">{settings.contactPage?.formTitle}</h3>
                             <form className="space-y-4">
                                <input type="text" placeholder="Your Name" className="w-full p-3 bg-slate-700 rounded-md text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500" />
                                <input type="email" placeholder="Your Email" className="w-full p-3 bg-slate-700 rounded-md text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500" />
                                <textarea rows={5} placeholder="Your Message" className="w-full p-3 bg-slate-700 rounded-md text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
                                <button type="submit" className="w-full py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400">Send Message</button>
                             </form>
                        </div>
                        <div className="space-y-8 pt-6">
                           {settings.contactPage?.addresses.map((addr, index) => (
                               <div key={index}>
                                   <h4 className="text-xl font-bold text-cyan-400">{addr.locationName}</h4>
                                   <p className="text-slate-300 mt-2">{addr.fullAddress}</p>
                                   <p className="text-slate-300">Phone: {addr.phone}</p>
                                   <p className="text-slate-300">Email: <a href={`mailto:${addr.email}`} className="hover:underline">{addr.email}</a></p>
                               </div>
                           ))}
                        </div>
                    </div>
                 </div>
            </footer>
        </div>
    );
};

export default LandingPage;
