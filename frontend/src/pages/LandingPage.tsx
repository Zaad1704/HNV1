// frontend/src/pages/LandingPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client'; // Import the apiClient

// The supportedLanguages configuration object remains the same
const supportedLanguages = {
    en: { name: 'EN', nativeName: 'English', currency: { code: 'USD', symbol: '$', rate: 1 }, countries: ['US', 'GB', 'CA', 'AU', 'IE', 'NZ'] },
    bn: { name: 'BN', nativeName: 'বাংলা', currency: { code: 'BDT', symbol: '৳', rate: 117 }, countries: ['BD'] },
    es: { name: 'ES', nativeName: 'Español', currency: { code: 'EUR', symbol: '€', rate: 0.92 }, countries: ['ES', 'MX', 'AR', 'CO', 'CL'] }
};

const LandingPageContent = () => {
    // --- All existing state remains the same ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [languageOptions, setLanguageOptions] = useState([]);

    // --- NEW: State for the feedback form ---
    const [feedback, setFeedback] = useState({ name: '', email: '', subject: '', message: '' });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // All useEffect hooks remain the same...
    useEffect(() => { /* PWA Logic */ }, []);
    useEffect(() => { /* Language Detection Logic */ }, []);


    // --- NEW: Handler for feedback form input changes ---
    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFeedback({ ...feedback, [e.target.name]: e.target.value });
    };

    // --- NEW: Handler for feedback form submission ---
    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormMessage({ type: '', text: '' });

        try {
            const response = await apiClient.post('/feedback', feedback);
            setFormMessage({ type: 'success', text: 'Thank you! Your feedback has been sent.' });
            setFeedback({ name: '', email: '', subject: '', message: '' }); // Clear form
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to send feedback. Please try again later.';
            setFormMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };


    // The rest of your component logic and data remains the same...
    const changeLanguage = (langCode: string) => {
        const newLang = supportedLanguages[langCode];
        if (newLang) {
            i18n.changeLanguage(langCode);
            setCurrency(newLang.currency);
        }
    };
    const executives = [/* ... */];
    const pricingPlans = [/* ... */];
    const sectionBackgrounds = {/* ... */};


    return (
        <div className="bg-slate-900 text-slate-200">
            {/* Header remains the same */}
            <header>
                {/* ... existing header JSX ... */}
            </header>
            
            <main>
                {/* All other sections (hero, features, etc.) remain the same */}
                {/* ... */}

                <section id="cta" style={{backgroundImage: sectionBackgrounds.cta}} className="relative bg-cover bg-center py-20">
                    {/* ... existing CTA JSX ... */}
                </section>
            </main>
      
            {/* --- REVISED: Footer / Contact Section --- */}
            <footer id="contact" style={{backgroundImage: `linear-gradient(to right, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.8)), ${sectionBackgrounds.contact}`}} className="relative bg-cover bg-center text-gray-300 py-16">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-12">
                        {/* REVISED TEXT */}
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Share Your Feedback & Ideas</h2>
                        <p className="text-cyan-300 mt-4 max-w-2xl mx-auto">Have a suggestion, complaint, or a feature request? We'd love to hear from you!</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        <div className="space-y-8">
                           {/* Office, Phone, Email details remain the same */}
                        </div>
                        <div>
                            <div className="bg-slate-800/70 backdrop-blur-md p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-semibold text-white mb-4">Feedback Form</h3>
                                
                                {/* UPDATED FORM with submission logic */}
                                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                    <input type="text" name="name" placeholder={t('contact.nameLabel')} value={feedback.name} onChange={handleFeedbackChange} required className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    <input type="email" name="email" placeholder={t('contact.emailLabel')} value={feedback.email} onChange={handleFeedbackChange} required className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    <input type="text" name="subject" placeholder={t('contact.subjectLabel')} value={feedback.subject} onChange={handleFeedbackChange} className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
                                    <textarea name="message" placeholder={t('contact.messageLabel')} rows={4} value={feedback.message} onChange={handleFeedbackChange} required className="w-full p-3 rounded-md bg-slate-900 text-white border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"></textarea>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-cyan-600 font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-slate-600">
                                      {isSubmitting ? 'Sending...' : t('contact.submitButton')}
                                    </button>
                                    {formMessage.text && (
                                        <p className={`text-center text-sm mt-4 ${formMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {formMessage.text}
                                        </p>
                                    )}
                                </form>
                            </div>
                        </div>
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
