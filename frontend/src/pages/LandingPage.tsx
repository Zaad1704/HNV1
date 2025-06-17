import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings'; // <-- The hook that powers the page

const LandingPageContent = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic));
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
            }
        };
        fetchPlans();
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Page...</div>;
    }

    if (isError || !settings) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">Error: Could not load page content. Please try again later.</div>;
    }

    // Dynamic styles based on fetched data
    const heroStyle = { backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.5)), url('${settings.heroSection.backgroundImageUrl}')` };
    const ctaSectionStyle = { backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.5)), url('${settings.ctaSection.backgroundImageUrl}')`};
    const ctaButtonStyle = { backgroundColor: settings.theme.secondaryColor, color: '#1a202c' };

    return (
        <div className="bg-slate-900 text-slate-200">
            <header className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <a href="#hero" className="flex items-center space-x-3">
                        <img src={settings.logos.navbarLogoUrl} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
                        <span className="text-xl font-bold text-white">HNV Property Management</span>
                    </a>
                    <nav className="hidden lg:flex items-center space-x-6">
                        <a href="#features" className="text-slate-300 hover:text-yellow-400">{t('header.features')}</a>
                        <a href="#about" className="text-slate-300 hover:text-yellow-400">{t('header.about')}</a>
                        <a href="#pricing" className="text-slate-300 hover:text-yellow-400">{t('header.pricing')}</a>
                        <a href="#contact" className="text-slate-300 hover:text-yellow-400">{t('header.contact')}</a>
                    </nav>
                    <div className="hidden lg:flex items-center space-x-4">
                         <Link to="/register" style={ctaButtonStyle} className="font-bold py-2 px-5 rounded-lg shadow-lg transition-all">{t('header.getStarted')}</Link>
                    </div>
                </div>
            </header>
            <main>
                <section id="hero" style={heroStyle} className="relative bg-cover bg-center text-white py-40">
                    <div className="container mx-auto px-6 text-center sm:text-left">
                        <h1 className="text-5xl lg:text-6xl font-extrabold mb-6">{settings.heroSection.title}</h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto sm:mx-0 mb-10">{settings.heroSection.subtitle}</p>
                        <Link to="/register" style={ctaButtonStyle} className="font-bold py-4 px-10 rounded-lg text-lg transition-all shadow-lg transform hover:scale-105">{settings.heroSection.ctaText}</Link>
                    </div>
                </section>

                <section id="features" className="py-20 text-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">{settings.featuresSection.title}</h2>
                            <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{settings.featuresSection.subtitle}</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-slate-800/70 p-8 rounded-2xl"><h3 className="text-xl font-bold text-teal-400 mb-3">{settings.featuresSection.card1Title}</h3><p className="text-slate-300">{settings.featuresSection.card1Text}</p></div>
                            <div className="bg-slate-800/70 p-8 rounded-2xl"><h3 className="text-xl font-bold text-teal-400 mb-3">{settings.featuresSection.card2Title}</h3><p className="text-slate-300">{settings.featuresSection.card2Text}</p></div>
                            <div className="bg-slate-800/70 p-8 rounded-2xl"><h3 className="text-xl font-bold text-teal-400 mb-3">{settings.featuresSection.card3Title}</h3><p className="text-slate-300">{settings.featuresSection.card3Text}</p></div>
                        </div>
                    </div>
                </section>
                
                <section id="about" className="py-20 text-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold">{settings.aboutSection.title}</h2>
                            <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{settings.aboutSection.subtitle}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                            <div>
                                <h3 className="text-2xl font-bold text-pink-400 mb-4">{settings.aboutSection.missionTitle}</h3><p className="mb-8 text-slate-300">{settings.aboutSection.missionText}</p>
                                <h3 className="text-2xl font-bold text-pink-400 mb-4">{settings.aboutSection.visionTitle}</h3><p className="text-slate-300">{settings.aboutSection.visionText}</p>
                            </div>
                            <div className="rounded-2xl overflow-hidden"><img src={settings.aboutSection.imageUrl} alt="Team Vision" className="w-full h-auto object-cover"/></div>
                        </div>
                    </div>
                </section>

                <section id="pricing" className="py-20 text-white">
                    {/* The pricing plans themselves are fetched separately, but titles are dynamic */}
                    <div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-bold">{t('pricing.title')}</h2><p className="text-slate-400 mt-4 max-w-2xl mx-auto">{t('pricing.subtitle')}</p></div>
                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {pricingPlans.map((plan: any) => ( <div key={plan._id} className="bg-slate-800/70 p-8 rounded-2xl flex flex-col">...</div> ))}
                    </div>
                </section>

                <section id="cta" style={ctaSectionStyle} className="relative bg-cover bg-center py-20">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-3xl font-bold text-white">{settings.ctaSection.title}</h2>
                        <p className="mt-4 mb-8 text-slate-300 max-w-xl mx-auto">{settings.ctaSection.subtitle}</p>
                        <Link to="/register" style={ctaButtonStyle} className="font-bold py-3 px-8 rounded-lg text-lg">{settings.ctaSection.buttonText}</Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
