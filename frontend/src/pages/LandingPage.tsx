import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import apiClient from '../api/client';
import { useWindowSize } from '../hooks/useWindowSize';
import {
    ChevronRight, Home, ShieldCheck, Briefcase,
    DownloadCloud, ArrowRight, CheckCircle, Star, Phone, Mail
} from 'lucide-react';

// --- (1) HELPER HOOK & COMPONENTS ---

function useWindowSize() {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth });
    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowSize;
}

const FullPageLoader = () => <div className="min-h-screen bg-brand-primary flex items-center justify-center text-white">Loading...</div>;

const DesktopSection = ({ id, children, className = '' }) => (
    <section id={id} className={`py-20 md:py-28 ${className}`}>
        <div className="container mx-auto px-6">{children}</div>
    </section>
);


// --- (2) SELF-CONTAINED SECTION COMPONENTS ---

const ContactFormComponent = ({ settings }) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ submitting: false, success: false, error: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ submitting: true, success: false, error: '' });
        try {
            await apiClient.post('/feedback', formData);
            setStatus({ submitting: false, success: true, error: '' });
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err: any) {
            setStatus({ submitting: false, success: false, error: err.response?.data?.message || 'Failed to send message.' });
        }
    };

    return (
        <div className="bg-light-card p-8 rounded-2xl shadow-lg border border-border-color">
            <h3 className="text-2xl font-bold text-dark-text mb-6">{settings?.contactPage?.formTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-light-text">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-3 bg-brand-bg border border-border-color rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-light-text">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full p-3 bg-brand-bg border border-border-color rounded-lg"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-light-text">Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="mt-1 w-full p-3 bg-brand-bg border border-border-color rounded-lg"></textarea>
                </div>
                <button type="submit" disabled={status.submitting} className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark disabled:opacity-50">
                    {status.submitting ? 'Sending...' : 'Send Message'}
                </button>
                {status.success && <p className="text-green-600">Message sent successfully!</p>}
                {status.error && <p className="text-red-600">{status.error}</p>}
            </form>
        </div>
    );
}

// --- (3) MAIN LAYOUTS (DESKTOP & MOBILE) ---

const DesktopLayout = ({ settings, plans }) => (
    <div className="bg-light-bg text-dark-text">
        {/* ... Hero and Features sections are unchanged ... */}
        <DesktopSection id="hero" className="text-white text-center !py-40" style={{ background: 'linear-gradient(135deg, #3D52A0, #7091E6)'}}>
             {/* Hero Content */}
        </DesktopSection>
        <DesktopSection id="featuresPage">
             {/* Features Content */}
        </DesktopSection>

        {/* About Section - With Executives */}
        <DesktopSection id="aboutPage" className="bg-brand-bg/80">
            <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                <div className="bg-light-card p-10 rounded-2xl shadow-lg border border-border-color">
                    <h3 className="text-2xl font-bold text-brand-dark mb-4">{settings.aboutPage?.missionTitle}</h3>
                    <p className="text-light-text leading-relaxed">{settings.aboutPage?.missionStatement}</p>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img src={settings.aboutPage?.imageUrl} alt="About Us" className="w-full h-auto object-cover"/>
                </div>
            </div>
            <div className="text-center mt-28">
                <h2 className="text-4xl font-bold text-dark-text">{settings.aboutPage?.teamTitle}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings.aboutPage?.teamSubtitle}</p>
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {settings.aboutPage?.executives.map((exec, index) => (
                        <div key={index} className="text-center">
                            <img src={exec.imageUrl} alt={exec.name} className="w-36 h-36 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"/>
                            <h4 className="text-xl font-bold text-dark-text">{exec.name}</h4>
                            <p className="text-brand-primary">{exec.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DesktopSection>

        {/* Pricing Section */}
        <DesktopSection id="pricingSection">
             {/* Pricing Content as before */}
        </DesktopSection>
        
        {/* Install App Section */}
        <DesktopSection id="installAppSection" className="bg-brand-bg/80">
            {/* Install App Content as before */}
        </DesktopSection>

        {/* Contact Section - With Form and Addresses */}
        <DesktopSection id="contact">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-dark-text">{settings?.contactPage?.title}</h2>
                <p className="mt-4 text-light-text max-w-2xl mx-auto">{settings?.contactPage?.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto items-start">
                <ContactFormComponent settings={settings} />
                <div className="space-y-8 text-light-text">
                    {settings?.contactPage?.addresses?.map((addr, index) => (
                        <div key={index}>
                            <h4 className="text-xl font-bold text-brand-dark">{addr.locationName}</h4>
                            <p className="mt-2 text-dark-text">{addr.fullAddress}</p>
                            <p className="flex items-center gap-2 mt-1"><Phone size={14}/> {addr.phone}</p>
                            <p className="flex items-center gap-2"><Mail size={14}/> {addr.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DesktopSection>
    </div>
);

const MobileLayout = ({ settings, plans }) => { /* ... Mobile layout code ... */ };


// --- (4) FINAL PAGE COMPONENT ---
const LandingPage = () => {
    const { data: settings, isLoading, isError } = useSiteSettings();
    const [plans, setPlans] = useState<any[]>([]);
    const { width } = useWindowZize();

    useEffect(() => {
        apiClient.get('/plans').then(res => {
            setPlans(res.data.data.filter(p => p.isPublic));
        }).catch(err => console.error("Failed to fetch plans", err));
    }, []);

    if (isLoading || isError || !settings) {
        return <FullPageLoader />;
    }

    if (width < 768) {
        return <MobileLayout settings={settings} plans={plans} />;
    }

    return <DesktopLayout settings={settings} plans={plans} />;
};

export default LandingPage;
