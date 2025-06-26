import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ArrowRight, Globe, Sun, Moon, Download } from 'lucide-react'; // Added Download import
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { lang, setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  // const navigate = useNavigate(); // No longer needed for internal section scrolling from Navbar
  // const location = useLocation(); // No longer needed for internal section scrolling from Navbar

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
      alert(t('install_app_manual_prompt', "To install, please use the 'Install' option in your browser's menu (usually found in the three-dot menu)."));
    }
  };

  return (
    <header className="bg-brand-dark/30 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-border-color/20">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo and Company Name */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="HNV Logo" className="h-10" width="40" height="40" />
          <span className="text-xl font-bold text-dark-text sm:inline">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </Link>
        
        {/* Desktop Navigation & Actions */}
        <div className="hidden lg:flex items-center gap-4">
            {showInstallButton && (
                <button onClick={handleInstallClick} className="inline-flex cursor-pointer items-center gap-2 bg-white text-brand-primary font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    <Download size={16} /> {t('install_app.cta', 'Install App')}
                </button>
            )}
            {/* Language and Theme Toggles */}
            {/* Separator */}
            <div className="w-px h-6 bg-border-color/50 mx-2"></div>
            
            <button 
                onClick={() => setLang(getNextToggleLanguage().code)}
                className="flex items-center gap-1 p-2 text-light-text rounded-md text-sm hover:bg-brand-secondary"
                title={`Switch to ${getNextToggleLanguage().name}`}
            >
                <Globe size={16} />
            </button>
            <button
                onClick={toggleTheme}
                className="p-2 text-light-text rounded-md text-sm hover:bg-brand-secondary"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            
            <Link to="/login" className="font-semibold text-light-text hover:text-dark-text px-4 py-2 rounded-md">
                {t('header.login')}
            </Link>
            <Link to="/register" className="flex items-center gap-2 font-bold text-brand-dark bg-brand-accent-light hover:bg-opacity-90 py-2 px-5 rounded-lg transition-all">
                {t('header.get_started')} <ArrowRight size={16} />
            </Link>
        </div>

        {/* Mobile-specific buttons can be placed here if needed */}
        <div className="lg:hidden flex items-center space-x-3">
             <Link to="/login" className="font-semibold text-light-text hover:text-dark-text rounded-md">
                {t('header.login')}
            </Link>
        </div>
      </div>
    </header>
  );
};
