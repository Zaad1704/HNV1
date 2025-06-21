import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { DownloadCloud } from 'lucide-react';

// This is a new component, create it in `frontend/src/components/landing/`
const InstallAppSection = () => {
    const { data: settings } = useSiteSettings();
    const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault(); // Prevent the mini-infobar from appearing on mobile
            setInstallPrompt(event);
            setIsVisible(true); // Show our custom UI
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        
        // Type assertion to access the prompt method
        const promptEvent = installPrompt as any; 
        promptEvent.prompt();
        
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null; // Don't render anything if the app isn't installable
    }

    return (
        <section id="installAppSection" className="py-20 bg-slate-800 text-white">
            <div className="container mx-auto px-6 text-center">
                 <h2 className="text-4xl font-bold">{settings?.installAppSection?.title}</h2>
                <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{settings?.installAppSection?.subtitle}</p>
                <button 
                    onClick={handleInstallClick}
                    className="mt-10 inline-flex items-center gap-3 bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400"
                >
                    <DownloadCloud />
                    Install App
                </button>
            </div>
        </section>
    );
};

export default InstallAppSection;
