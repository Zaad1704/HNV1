import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { CheckCircle, Menu, X, ArrowRight } from 'lucide-react';

// --- Main Landing Page Component ---
const LandingPageContent = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactMessage, setContactMessage] = useState({ type: '', text: '' });
    
    const { data: settings, isLoading, isError } = useSiteSettings();

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic));
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
            }
        };
        fetchPlans();
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactMessage({ type: 'info', text: 'Sending...' });
        try {
            await apiClient.post('/feedback', contactForm);
            setContactMessage({ type: 'success', text: 'Thank you for your message! We will get back to you shortly.' });
            setContactForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setContactMessage({ type: 'error', text: 'Failed to send message. Please try again later.' });
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Page...</div>;
    }
    if (isError || !settings) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">Error: Could not load page content.</div>;
    }

    const heroStyle = { backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.95), rgba(2, 6, 23, 0.7)), url('${settings.heroSection?.backgroundImageUrl}')` };
    const ctaSectionStyle = { backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), url('${settings.ctaSection?.backgroundImageUrl}')`};

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "About", href: "#about" },
        { name: "Pricing", href: "#pricing" },
        { name: "Contact", href: "#contact" }
    ];

    return (
        <div className="bg-slate-900 text-slate-300 font-sans">
            {/* --- HEADER --- */}
            <header className="bg-slate-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={settings.logos?.navbarLogoUrl} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
                        <span className="text-xl font-bold text-white">HNV Solutions</span>
                    </Link>
                    
                    {/* Desktop Navigation */}
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

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-slate-800">
                        <nav className="flex flex-col items-center space-y-4 py-6">
                            {navLinks.map(link => (
                               <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="font-medium text-slate-300 hover:text-yellow-400 transition-colors">{link.name}</a>
                            ))}
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="font-semibold text-white hover:text-yellow-400 pt-4 border-t border-slate-700 w-full text-center">Portal Log In</Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="font-bold text-slate-900 bg-yellow-500 hover:bg-yellow-400 py-2 px-5 rounded-lg w-4/5 text-center">Get Started</Link>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                {/* --- HERO SECTION --- */}
                <section id="hero" style={heroStyle} className="relative bg-cover bg-center text-white py-32 md:py-48 px-4">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">{settings.heroSection?.title}</h1>
                        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10">{settings.heroSection?.subtitle}</p>
                        <Link to="/register" className="font-bold py-4 px-10 rounded-lg text-lg bg-yellow-500 text-slate-900 hover:bg-yellow-400 transition-transform transform hover:scale-105 inline-block">{settings.heroSection?.ctaText}</Link>
                    </div>
                </section>
                
                 {/* --- FEATURES SECTION --- */}
                <section id="features" className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto px-6 text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">{settings.featuresSection?.title}</h2>
                        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{settings.featuresSection?.subtitle}</p>
                    </div>
                    <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
                        <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10"><h3 className="text-xl font-bold text-cyan-400 mb-3">{settings.featuresSection?.card1Title}</h3><p className="text-slate-400">{settings.featuresSection?.card1Text}</p></div>
                        <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10"><h3 className="text-xl font-bold text-cyan-400 mb-3">{settings.featuresSection?.card2Title}</h3><p className="text-slate-400">{settings.featuresSection?.card2Text}</p></div>
                        <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700 transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10"><h3 className="text-xl font-bold text-cyan-400 mb-3">{settings.featuresSection?.card3Title}</h3><p className="text-slate-400">{settings.featuresSection?.card3Text}</p></div>
                    </div>
                </section>
                
                {/* --- ABOUT SECTION --- */}
                <section id="about" className="py-20 bg-slate-800/50">
                     <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div className="flex justify-center">
                            <img src={settings.aboutSection?.imageUrl} alt="About Us Image" className="rounded-2xl shadow-2xl object-cover w-full h-auto max-w-md" />
                        </div>
                        <div className="md:order-first">
                           <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{settings.aboutSection?.title}</h2>
                           <h3 className="text-2xl font-semibold text-yellow-400 mb-3">{settings.aboutSection?.missionTitle}</h3>
                           <p className="text-slate-300 mb-6">{settings.aboutSection?.missionText}</p>
                           <h3 className="text-2xl font-semibold text-yellow-400 mb-3">{settings.aboutSection?.visionTitle}</h3>
                           <p className="text-slate-300">{settings.aboutSection?.visionText}</p>
                        </div>
                    </div>
                </section>

                {/* --- PRICING SECTION --- */}
                <section id="pricing" className="py-20 bg-slate-900">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Choose Your Plan</h2>
                        <p className="text-slate-400 mt-4 max-w-xl mx-auto">Simple, transparent pricing to help you grow. No hidden fees.</p>
                    </div>
                    <div className="container mx-auto mt-16 grid lg:grid-cols-3 gap-8 px-6 items-stretch">
                        {pricingPlans.map(plan => (
                            <div key={plan._id} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col hover:border-cyan-500 transition-colors">
                                <h3 className="text-2xl font-bold text-yellow-400">{plan.name}</h3>
                                <p className="text-4xl font-extrabold text-white mt-4">${(plan.price / 100).toFixed(2)}<span className="text-lg font-medium text-slate-400"> / {plan.duration}</span></p>
                                <div className="border-t border-slate-700 my-6"></div>
                                <ul className="space-y-3 mt-6 text-slate-300 flex-grow">
                                    {plan.features.map((feature: string) => (
                                        <li key={feature} className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" />{feature}</li>
                                    ))}
                                </ul>
                                <Link to={`/register?plan=${plan._id}`} className="block w-full text-center mt-8 bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-500 transition-transform transform hover:scale-105">Choose Plan</Link>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* --- FINAL CTA SECTION --- */}
                <section id="cta" style={ctaSectionStyle} className="relative bg-cover bg-center py-20">
                    <div className="container mx-auto px-6 text-center relative z-10">
                        <h2 className="text-3xl font-bold text-white">{settings.ctaSection?.title}</h2>
                        <p className="mt-4 mb-8 text-slate-300 max-w-xl mx-auto">{settings.ctaSection?.subtitle}</p>
                        <Link to="/register" className="font-bold py-3 px-8 rounded-lg text-lg bg-yellow-500 text-slate-900 hover:bg-yellow-400">{settings.ctaSection?.buttonText}</Link>
                    </div>
                </section>
            </main>

            {/* --- FOOTER & CONTACT FORM --- */}
            <footer id="contact" className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
                 <div className="container mx-auto px-6 text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">{settings.contactSection?.title}</h2>
                        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{settings.contactSection?.subtitle}</p>
                    </div>
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">{settings.contactSection?.formTitle}</h3>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <input type="text" name="name" placeholder="Full Name" required value={contactForm.name} onChange={handleContactChange} className="
