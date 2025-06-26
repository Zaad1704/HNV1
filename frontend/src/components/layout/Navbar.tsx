// frontend/src/components/layout/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Globe, Sun, Moon, Download, ArrowRight } from 'lucide-react'; // Added ArrowRight import
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link as ScrollLink } from 'react-scroll';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

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


  const navLinks = [
    { key: 'header.features', href: '#featuresPage' },
    { key: 'header.about', href: '#about' },
    { key: 'header.pricing', href: '#pricing' }, // Updated to #pricing as per new LandingPage.tsx
    { key: 'header.services', href: '#services' }, // Added services
    { key: 'header.leadership', href: '#leadership' }, // Added leadership
    { key: 'header.contact', href: '#contact' },
    { key: 'install_app.cta', href: '#install-app' }, // Added install app section link
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);

    // Always navigate to the root path first if not already there, then scroll
    if (location.pathname !== '/') { navigate('/'); }
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const NavLinksContent = () => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.key}
          href={link.href}
          onClick={(e) => handleScroll(e, link.href)}
          className="font-medium transition-colors rounded-md px-3 py-2 text-white hover:bg-white/20"
        >
          {t(link.key)}
        </a>
      ))}
    </>
  );

  return (
    <header className="bg-gradient-to-r from-brand-secondary to-brand-primary backdrop-blur-md sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
        {/* Left-aligned utility buttons for desktop */}
        <div className="hidden lg:flex items-center gap-2">
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
                <button onClick={handleInstallClick} className="inline-flex cursor-pointer items-center gap-2 bg-white text-brand-primary font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    <Download size={16} /> {t('install_app.cta', 'Install App')}
                </button>
            )}
        </div>
        
        {/* Centered Website Name */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="text-xl font-bold text-white whitespace-nowrap">
                {settings?.logos?.companyName || 'HNV Solutions'}
            </Link>
        </div>

        {/* Right-aligned navigation and login for desktop */}
        <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-1">
                <NavLinksContent />
            </nav>

            <div className="w-px h-6 bg-white/50 mx-2"></div>
            
            <Link to="/login" className="font-semibold text-white hover:bg-white/20 px-4 py-2 rounded-md">
                {t('header.login')}
            </Link>
            <Link to="/register" className="flex items-center gap-2 font-bold text-brand-primary bg-white hover:bg-gray-100 py-2 px-5 rounded-lg transition-all">
                {t('header.get_started')} <ArrowRight size={16} />
            </Link>
        </div>

        {/* Mobile-specific buttons (login only, utilities are in PublicBottomNavBar) */}
        <div className="lg:hidden flex items-center space-x-3">
             <Link to="/login" className="font-semibold text-white hover:text-gray-200">
                {t('header.login')}
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
