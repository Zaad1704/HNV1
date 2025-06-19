// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { CheckCircle, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';

const LandingPage = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTeamVisible, setTeamVisible] = useState(false);
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    
    const { data: settings, isLoading, isError } = useSiteSettings();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                const publicPlans = response.data.data.filter((p: any) => p.isPublic !== false); // Filter for public plans
                setPricingPlans(publicPlans);
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
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">Error: Could not load page content.</div>;
    }

    const heroStyle = { backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.7)), url('${settings.heroSection?.backgroundImageUrl}')` };
    const ctaSectionStyle = { backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url('${settings.ctaSection?.backgroundImageUrl}')`};

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "About", href: "#about" },
        { name: "Pricing", href: "#pricing" },
        { name: "Contact", href: "#contact" }
    ];

    return (
        <div className="bg-slate-900 text-slate-300 font-sans">
            <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={settings.logos?.navbarLogoUrl} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
                        <span className="text-xl font-bold text-white">HNV Solutions</span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                           <a key={link.name} href={link.href} className="font-medium text-slate-300 hover:text-yellow-400 transition-colors">{link.name}</a>
                        ))}
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="font-semibold text-white hover:text-yellow-400">Portal Log In</Link>
                        <Link to="/register" className="font-bold text-slate-900 bg-yellow-500 hover:bg-yellow-400 py-2 px-5 rounded-lg flex items-center gap-2">
                            Get Started <ArrowRight size={16}/>
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-800">
                        {/* Mobile menu JSX remains the same */}
                    </div>
                )}
            </header>

            <main>
                <section id="hero" style={heroStyle} className="relative bg-cover bg-center text-white py-32 md:py-48 px-4 text-center">
                     <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{settings.heroSection?.title}</h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-slate-300">{settings.heroSection?.subtitle}</p>
                    <Link to="/register" className="mt-10 inline-block bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400 transition-transform transform hover:scale-105">
                        {settings.heroSection?.ctaText}
                    </Link>
                </section>
                
                {/* --- Pricing Section --- */}
                <section id="pricing" className="py-20 bg-slate-900">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">{settings.pricingSection?.title}</h2>
                        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{settings.pricingSection?.subtitle}</p>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {pricingPlans.map(plan => (
                                <div key={plan._id} className="bg-slate-800/70 border border-slate-700 rounded-2xl p-8 flex flex-col text-left">
                                    <h3 className="text-2xl font-bold text-yellow-400">{plan.name}</h3>
                                    <p className="text-4xl font-extrabold text-white mt-4">
                                        ${(plan.price / 100).toFixed(2)}
                                        <span className="text-base font-medium text-slate-400"> / {plan.duration}</span>
                                    </p>
                                    <ul className="text-slate-300 space-y-3 mt-8">
                                        {plan.features.map((feature: string) => (
                                            <li key={feature} className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex-grow"></div>
                                    <Link to={`/register?plan=${plan._id}`} className="mt-8 block w-full bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-500 transition-colors text-center">
                                        Choose Plan
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                 {/* ... other sections like About, CTA, etc. remain the same */}
            </main>

            <footer id="contact" className="bg-slate-800 border-t border-slate-700 pt-16 pb-8">
                {/* Footer JSX remains the same */}
            </footer>
        </div>
    );
};

export default LandingPage;
