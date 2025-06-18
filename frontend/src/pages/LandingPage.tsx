import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { CheckCircle } from 'lucide-react'; // Icon for features

// --- Main Landing Page Component ---
const LandingPageContent = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- STATE MANAGEMENT ---
    // State for the PWA installation prompt
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    // State for pricing plans
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    // State for the contact form
    const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [contactMessage, setContactMessage] = useState({ type: '', text: '' });
    
    // --- DATA FETCHING ---
    const { data: settings, isLoading, isError } = useSiteSettings();

    // --- PWA INSTALLATION LOGIC ---
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            console.log('beforeinstallprompt event fired');
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
    };

    // --- PRICING & CONTACT FORM LOGIC ---
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await apiClient.get('/plans');
                // Filter for plans marked as public to display on the pricing page
                setPricingPlans(response.data.data.filter((p: any) => p.isPublic));
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
            }
        };
        fetchPlans();
    }, []);

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactMessage({ type: 'info', text: 'Sending...' });
        try {
            await apiClient.post('/feedback', contactForm);
            setContactMessage({ type: 'success', text: 'Thank you for your message! We will get back to you shortly.' });
            setContactForm({ name: '', email: '', subject: '', message: '' }); // Clear form
        } catch (err) {
            setContactMessage({ type: 'error', text: 'Failed to send message. Please try again later.' });
        }
    };


    // --- RENDER LOGIC ---
    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Page...</div>;
    }

    if (isError || !settings) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400">Error: Could not load page content. Please ensure the backend is running and configured correctly.</div>;
    }

    const heroStyle = { backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.6)), url('${settings.heroSection?.backgroundImageUrl}')` };
    const ctaSectionStyle = { backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.5)), url('${settings.ctaSection?.backgroundImageUrl}')`};

    return (
        <div className="bg-slate-900 text-slate-200 font-sans">
            {/* --- HEADER --- */}
            <header className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <a href="#hero" className="flex items-center space-x-3">
                        <img src={settings.logos?.navbarLogoUrl} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
                        <span className="text-xl font-bold text-white">HNV Property Management</span>
                    </a>
                    <nav className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="font-medium text-slate-300 hover:text-yellow-400">Features</a>
                        <a href="#about" className="font-medium text-slate-300 hover:text-yellow-400">About</a>
                        <a href="#pricing" className="font-medium text-slate-300 hover:text-yellow-400">Pricing</a>
                        <a href="#contact" className="font-medium text-slate-300 hover:text-yellow-400">Contact</a>
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        {installPrompt && (
                             <button onClick={handleInstallClick} className="font-semibold text-slate-900 bg-white hover:bg-slate-200 py-2 px-4 rounded-lg">Install App</button>
                        )}
                        <Link to="/login" className="font-semibold text-white bg-yellow-500 hover:bg-yellow-400 py-2 px-4 rounded-lg">Portal Log In</Link>
                    </div>
                </div>
            </header>

            <main>
                {/* --- HERO SECTION --- */}
                <section id="hero" style={heroStyle} className="relative bg-cover bg-center text-white py-40 px-4">
                    <div className="container mx-auto text-center">
                        <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">{settings.heroSection?.title}</h1>
                        <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">{settings.heroSection?.subtitle}</p>
                        <Link to="/register" className="font-bold py-4 px-10 rounded-lg text-lg bg-yellow-500 text-slate-900 hover:bg-yellow-400 transition-transform transform hover:scale-105">{settings.heroSection?.ctaText}</Link>
                    </div>
                </section>

                {/* --- FEATURES SECTION --- */}
                <section id="features" className="py-20 text-white bg-slate-900">
                    <div className="container mx-auto px-6 text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold">{settings.featuresSection?.title}</h2>
                        <p className="text-slate-300 mt-4 max-w-2xl mx-auto">{settings.featuresSection?.subtitle}</p>
                    </div>
                    <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6">
                        <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700"><h3 className="text-xl font-bold text-cyan-400 mb-3">{settings.featuresSection?.card1Title}</h3><p>{settings.featuresSection?.card1Text}</p></div>
                        <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700"><h3 className="text-xl font-bold text-cyan-400 mb-3">{settings.featuresSection?.card2Title}</h3><p>{settings.featuresSection?.card2Text}</p></div>
                        <div className="bg-slate-800/70 p-8 rounded-2xl border border-slate-700"><h3 className="text-xl font-bold text-cyan-400 mb-3">{settings.featuresSection?.card3Title}</h3><p>{settings.featuresSection?.card3Text}</p></div>
                    </div>
                </section>
                
                {/* --- ABOUT SECTION --- */}
                <section id="about" className="py-20 bg-slate-800">
                     <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                           <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{settings.aboutSection?.title}</h2>
                           <h3 className="text-2xl font-semibold text-yellow-400 mb-3">{settings.aboutSection?.missionTitle}</h3>
                           <p className="text-slate-300 mb-6">{settings.aboutSection?.missionText}</p>
                           <h3 className="text-2xl font-semibold text-yellow-400 mb-3">{settings.aboutSection?.visionTitle}</h3>
                           <p className="text-slate-300">{settings.aboutSection?.visionText}</p>
                        </div>
                        <div className="flex justify-center">
                            <img src={settings.aboutSection?.imageUrl} alt="About Us Image" className="rounded-2xl shadow-2xl object-cover w-full h-auto max-w-md" />
                        </div>
                    </div>
                </section>
                
                {/* --- PRICING SECTION --- */}
                <section id="pricing" className="py-20 bg-slate-900">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Choose Your Plan</h2>
                        <p className="text-slate-300 mt-4 max-w-xl mx-auto">Simple, transparent pricing to help you grow. No hidden fees.</p>
                    </div>
                    <div className="container mx-auto mt-16 grid lg:grid-cols-3 gap-8 px-6">
                        {pricingPlans.map(plan => (
                            <div key={plan._id} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col">
                                <h3 className="text-2xl font-bold text-yellow-400">{plan.name}</h3>
                                <p className="text-4xl font-extrabold text-white mt-4">${(plan.price / 100).toFixed(2)}<span className="text-lg font-medium text-slate-400"> / {plan.duration}</span></p>
                                <ul className="space-y-3 mt-6 text-slate-300 flex-grow">
                                    {plan.features.map((feature: string) => (
                                        <li key={feature} className="flex items-center"><CheckCircle className="w-5 h-5 text-green-400 mr-2" />{feature}</li>
                                    ))}
                                </ul>
                                <Link to={`/register?plan=${plan._id}`} className="block w-full text-center mt-8 bg-cyan-600 text-white font-bold py-3 rounded-lg hover:bg-cyan-500">Choose Plan</Link>
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
            <footer id="contact" className="bg-slate-800 border-t border-slate-700 pt-16 pb-8">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-3xl font-bold text-white">{settings.contactSection?.title}</h2>
                        <p className="text-slate-300 mt-4 mb-8">{settings.contactSection?.subtitle}</p>
                        <div className="space-y-4">
                            <p><strong>{settings.contactSection?.officeTitle}:</strong> 123 Property Lane, KL, Malaysia</p>
                            <p><strong>{settings.contactSection?.phoneTitle}:</strong> +60 3 1234 5678</p>
                            <p><strong>{settings.contactSection?.emailTitle}:</strong> contact@hnvsolutions.com</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">{settings.contactSection?.formTitle}</h3>
                        <form onSubmit={handleContactSubmit} className="space-y-4">
                            <input type="text" name="name" placeholder="Full Name" required value={contactForm.name} onChange={handleContactChange} className="w-full p-3 bg-slate-900 rounded-lg border border-slate-600"/>
                            <input type="email" name="email" placeholder="Email Address" required value={contactForm.email} onChange={handleContactChange} className="w-full p-3 bg-slate-900 rounded-lg border border-slate-600"/>
                            <input type="text" name="subject" placeholder="Subject" required value={contactForm.subject} onChange={handleContactChange} className="w-full p-3 bg-slate-900 rounded-lg border border-slate-600"/>
                            <textarea name="message" placeholder="Your Message" rows={4} required value={contactForm.message} onChange={handleContactChange} className="w-full p-3 bg-slate-900 rounded-lg border border-slate-600"></textarea>
                            <button type="submit" className="w-full py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400">Send Message</button>
                            {contactMessage.text && <p className={`text-center mt-4 ${contactMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{contactMessage.text}</p>}
                        </form>
                    </div>
                </div>
                <div className="container mx-auto text-center border-t border-slate-700 mt-16 pt-8 text-slate-400">
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

// This wrapper provides the i18n context to the landing page.
const AppWrapper = () => (
    <I18nextProvider i18n={i18n}>
        <LandingPageContent />
    </I18nextProvider>
);

export default AppWrapper;
