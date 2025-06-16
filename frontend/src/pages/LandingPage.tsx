import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../services/i18n';
import apiClient from '../api/client';

const supportedLanguages = {
    en: { name: 'EN', nativeName: 'English', currency: { code: 'USD', symbol: '$', rate: 1 }, countries: ['US', 'GB', 'CA', 'AU', 'IE', 'NZ'] },
    bn: { name: 'BN', nativeName: 'বাংলা', currency: { code: 'BDT', symbol: '৳', rate: 117 }, countries: ['BD'] },
    es: { name: 'ES', nativeName: 'Español', currency: { code: 'EUR', symbol: '€', rate: 0.92 }, countries: ['ES', 'MX', 'AR', 'CO', 'CL'] }
};

const LandingPageContent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const [currency, setCurrency] = useState({ code: 'USD', symbol: '$', rate: 1 });
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [languageOptions, setLanguageOptions] = useState<any[]>([]);
    
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    const [feedback, setFeedback] = useState({ name: '', email: '', subject: '', message: '' });
    const [formMessage, setFormMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
        }
    };

    useEffect(() => {
        const fetchUserLocale = async () => {
            const apiKey = '7903077ee3c324';
            try {
                const response = await fetch(`https://ipinfo.io/json?token=${apiKey}`);
                if (!response.ok) throw new Error('Failed to fetch IP info');
                const data = await response.json();
                const userCountry = data.country;
                const detectedLangCode = Object.keys(supportedLanguages).find(langCode => 
                    (supportedLanguages as any)[langCode].countries.includes(userCountry)
                );
                const defaultLang = supportedLanguages.en;
                const detectedLang = (supportedLanguages as any)[detectedLangCode || 'en'] || defaultLang;
                i18n.changeLanguage(detectedLangCode || 'en');
                setCurrency(detectedLang.currency);
                if (detectedLang.name !== 'EN') {
                    setLanguageOptions([detectedLang, defaultLang]);
                } else {
                    setLanguageOptions([defaultLang]);
                }
            } catch (error) {
                console.error("Could not fetch user locale, defaulting to English:", error);
                const defaultLang = supportedLanguages.en;
                i18n.changeLanguage('en');
                setCurrency(defaultLang.currency);
                setLanguageOptions([defaultLang]);
            }
        };
        fetchUserLocale();
    }, [i18n]); 

    const changeLanguage = (langCode: string) => {
        const newLang = (supportedLanguages as any)[langCode];
        if (newLang) {
            i18n.changeLanguage(langCode);
            setCurrency(newLang.currency);
        }
    };

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFeedback({ ...feedback, [e.target.name]: e.target.value });
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormMessage({ type: '', text: '' });
        try {
            await apiClient.post('/feedback', feedback);
            setFormMessage({ type: 'success', text: 'Thank you! Your feedback has been sent.' });
            setFeedback({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to send feedback. Please try again later.';
            setFormMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const executives = [
      { name: "Jane Doe", title: "Chief Executive Officer", img: "https://picsum.photos/id/1005/150/150" },
      { name: "John Smith", title: "Chief Technology Officer", img: "https://picsum.photos/id/1011/150/150" },
      { name: "Alice Brown", title: "Chief Operations Officer", img: "https://picsum.photos/id/1027/150/150" }
    ];
    
    const sectionBackgrounds = {
      hero: `url('https://picsum.photos/id/1074/1920/1080')`,
      features: `url('https://picsum.photos/id/1062/1920/1080')`,
      about: `url('https://picsum.photos/id/1041/1920/1080')`,
      pricing: `url('https://picsum.photos/id/103/1920/1080')`,
      cta: `url('https://picsum.photos/id/12/1920/1080')`,
      contact: `url('https://picsum.photos/id/1015/1920/1080')`
    };

    return (
        <div className="bg-slate-900 text-slate-200">
            <style>{` html { scroll-behavior: smooth; } `}</style>
            <header className="bg-
