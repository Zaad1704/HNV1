// frontend/src/components/landing/InstallAppSection.tsx

import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { DownloadCloud } from 'lucide-react';

const InstallAppSection = () => {
    const { data: settings } = useSiteSettings();
    const [installPrompt, setInstallPrompt] = useState<any | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) {
            alert("Installation is handled by your browser. Please look for an 'Install' icon in the address bar or browser menu.");
            return;
        }
        
        installPrompt.prompt();
        
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }
        
        setInstallPrompt(null);
    };

    return (
        <section id="installAppSection" className="py-20 bg-primary/5 dark:bg-dark-bg">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.installAppSection?.title}</h2>
                <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings?.installAppSection?.subtitle}</p>

                <button 
                    onClick={handleInstallClick}
                    className="mt-10 inline-flex items-center gap-3 bg-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-700 shadow-xl transition-transform transform hover:scale-105"
                >
                    <DownloadCloud />
                    Install App
                </button>
            </div>
        </section>
    );
};

export default InstallAppSection;
