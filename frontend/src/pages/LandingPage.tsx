import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { CheckCircle, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';

const LandingPageContent = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTeamVisible, setTeamVisible] = useState(false); // State for the leadership section
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
                <section id="hero" style={heroStyle} className="relative bg-cover bg-center text-white py-32 md:py-48 px-4">
                    {/* Hero Content... */}
                </section>
                
                <section id="features" className="py-20 bg-slate-900 text-white">
                    {/* Features Content... */}
                </section>
                
                <section id="about" className="py-20 bg-slate-800/50">
                     {/* About Content... */}
                </section>
                
                {/* --- NEW/MODIFIED: Leadership Section --- */}
                {(settings.aboutSection?.executives?.length > 0) && (
                    <section id="leadership" className="py-20 bg-slate-900">
                        <div className="container mx-auto px-6 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">{settings.aboutSection?.teamTitle}</h2>
                            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{settings.aboutSection?.teamSubtitle}</p>
                            
                            <button 
                                onClick={() => setTeamVisible(!isTeamVisible)} 
                                className="mt-8 flex items-center gap-2 mx-auto px-6 py-3 border border-slate-600 rounded-lg text-white hover:bg-slate-800"
                            >
                                {isTeamVisible ? 'Hide Team' : 'Show Team'}
                                <ChevronDown size={20} className={`transition-transform ${isTeamVisible ? 'rotate-180' : ''}`} />
                            </button>

                            {isTeamVisible && (
                                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center">
                                    {settings.aboutSection?.executives.map((exec, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <img src={exec.imageUrl} alt={exec.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-700"/>
                                            <h4 className="text-xl font-bold text-white">{exec.name}</h4>
                                            <p className="text-yellow-400">{exec.title}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}


                <section id="pricing" className="py-20 bg-slate-900">
                    {/* Pricing Content... */}
                </section>
                
                <section id="cta" style={ctaSectionStyle} className="relative bg-cover bg-center py-20">
                    {/* CTA Content... */}
                </section>
            </main>

            <footer id="contact" className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
                 <div className="container mx-auto px-6 text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">{settings.contactSection?.title}</h2>
                        <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{settings.contactSection?.subtitle}</p>
                    </div>
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">{settings.contactSection?.formTitle}</h3>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            {/* Contact Form Inputs... */}
                        </form>
                    </div>
                     <div className="space-y-6">
                        {/* --- MODIFIED to loop through addresses --- */}
                        {settings.contactSection?.addresses?.map((addr, index) => (
                            <div key={index}>
                                <h4 className="font-bold text-white text-lg">{addr.locationName}</h4>
                                <p className="text-slate-400">{addr.fullAddress}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="container mx-auto text-center border-t border-slate-800 mt-16 pt-8 text-slate-500">
                    <p>&copy; {new Date().getFullYear()} HNV Property Management Solutions. All Rights Reserved.</p>
                    <div className="mt-4 space-x-4">
                        <Link to="/terms" className="hover:text-white">Terms & Conditions</Link>
                        <span>|</span>
                        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
