// frontend/src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Globe, Sun, Moon, Download } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link as ScrollLink } from 'react-scroll';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Event listener for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if the app is already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(true);
      }
    };

    // Event listener for appinstalled
    const handleAppInstalled = () => {
      setShowInstallButton(false); // Hide button if app is installed
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setShowInstallButton(false); // Hide button if user installs
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      setDeferredPrompt(null);
    } else {
      alert("To install the app, please use your browser's 'Add to Home Screen' or 'Install App' feature.");
    }
  };

  return (
    <header className="bg-gradient-to-r from-brand-secondary to-brand-primary backdrop-blur-md sticky top-0 z-50 border-b border-border-color/50 dark:border-border-color-dark/50">
      <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
        {/* Left-aligned Buttons */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setLang(getNextToggleLanguage().code)}
                className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                title={`Switch to ${getNextToggleLanguage().name}`}
            >
                <Globe size={20} />
            </button>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {showInstallButton && (
                <button onClick={handleInstallClick} className="hidden sm:inline-flex cursor-pointer items-center gap-2 bg-white text-brand-primary font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    <Download size={16} /> Install App
                </button>
            )}
        </div>
        
        {/* Centered Website Name */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="text-xl font-bold text-white whitespace-nowrap">
                {settings?.logos?.companyName || 'HNV Solutions'}
            </Link>
        </div>

        {/* Right-aligned Logo */}
        <div>
            <Link to="/">
                <img src="/logo-min.png" alt="Company Logo" className="h-12 w-12 sm:h-14 sm:w-14" />
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
