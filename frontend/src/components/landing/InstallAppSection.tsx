import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { DownloadCloud } from 'lucide-react';

const InstallAppSection = () => {
    const { data: settings } = useSiteSettings();
    const [installPrompt, setInstallPrompt] = useState<any | null>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            event.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(event);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Cleanup the event listener when the component unmounts
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        // If there's no prompt, do nothing.
        if (!installPrompt) return;
        
        // Show the browser's installation prompt.
        installPrompt.prompt();
        
        // Wait for the user to respond to the prompt.
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }
        
        // We can only use the prompt once. Clear it.
        setInstallPrompt(null);
    };

    // The entire section is now always rendered.
    // The button's functionality is what's conditional.
    return (
        <section id="installAppSection" className="py-20 bg-slate-800 text-white">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl font-bold">{settings?.installAppSection?.title}</h2>
                <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{settings?.installAppSection?.subtitle}</p>
                <p className="mt-4 text-xs text-slate-400">(If an install button doesn't appear below, look for an install icon in your browser's address bar)</p>
                
                {/* The button is only rendered if the browser provides an install prompt */}
                {installPrompt && (
                    <button 
                        onClick={handleInstallClick}
                        className="mt-8 inline-flex items-center gap-3 bg-yellow-500 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400 transition-transform transform hover:scale-105"
                    >
                        <DownloadCloud />
                        Install App on Your Device
                    </button>
                )}
            </div>
        </section>
    );
};

export default InstallAppSection;
