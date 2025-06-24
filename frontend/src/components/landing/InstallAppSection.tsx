// frontend/src/components/landing/InstallAppSection.tsx

import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { DownloadCloud } from 'lucide-react';

const InstallAppSection = () => {
    const { data: settings } = useSiteSettings();
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            alert("To install, please use the 'Install' icon in your browser's address bar or the 'Add to Home Screen' option in your browser's menu.");
            return;
        }
        installPrompt.prompt();
    };

    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.installAppSection?.title}</h2>
            <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings?.installAppSection?.subtitle}</p>
            <button 
                onClick={handleInstallClick}
                className="mt-10 inline-flex items-center gap-3 bg-brand-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 shadow-xl transition-transform transform hover:scale-105" // Changed bg-primary to bg-brand-primary
            >
                <DownloadCloud />
                Install App on Your Device
            </button>
        </div>
    );
};

export default InstallAppSection;
