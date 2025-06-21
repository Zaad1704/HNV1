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
        if (installPrompt) {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            setInstallPrompt(null); // Prompt can only be used once
        } else {
            // Fallback for browsers that don't support the event or on desktop
            alert('To install the app, look for the "Install" icon in your browser\'s address bar or menu.');
        }
    };

    return (
        <section id="installAppSection" className="py-20 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{settings?.installAppSection?.title}</h2>
                <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{settings?.installAppSection?.subtitle}</p>

                <button
                    onClick={handleInstallClick}
                    className="mt-8 inline-flex items-center gap-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-indigo-500 dark:hover:bg-indigo-400 transition-transform transform hover:scale-105 shadow-md"
                >
                    <DownloadCloud />
                    Install App on Your Device
                </button>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">(Look for an install icon in your browser's address bar or menu if the button above doesn't function immediately.)</p>
            </div>
        </section>
    );
};

export default InstallAppSection;
