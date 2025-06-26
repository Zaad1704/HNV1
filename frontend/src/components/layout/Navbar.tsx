import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Globe, Sun, Moon, ArrowRight } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="app-gradient sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Desktop & Mobile: Centered layout */}
        <div className="flex items-center justify-between">
          {/* Left: Theme & Language */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLang(getNextToggleLanguage().code)} 
              className="btn-glass p-3 rounded-full"
              title={`Switch to ${getNextToggleLanguage().name}`}
            >
              <Globe size={20} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="btn-glass p-3 rounded-full"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          {/* Center: Brand */}
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
            {settings?.logos?.faviconUrl && (
              <img 
                src={settings.logos.faviconUrl} 
                alt="Logo" 
                className="h-8 w-8 rounded-lg" 
              />
            )}
            <span className="hidden sm:block">
              {settings?.logos?.companyName || 'HNV Solutions'}
            </span>
          </Link>

          {/* Right: Get Started */}
          <Link 
            to="/register" 
            className="btn-glass flex items-center gap-2 font-semibold px-6 py-3"
          >
            {t('header.get_started')} 
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
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
      <div className="container mx-auto px-4 sm:px-6 py-2">
        {/* Desktop Navbar: Grid layout for robust centering */}
        <div className="hidden lg:grid grid-cols-3 items-center">
            {/* Left Items */}
            <div className="flex items-center gap-2 justify-self-start">
                <button onClick={() => setLang(getNextToggleLanguage().code)} className="p-2 rounded-full text-white hover:bg-white/20 transition-colors" title={`Switch to ${getNextToggleLanguage().name}`}>
                    <Globe size={20} />
                </button>
                <button onClick={toggleTheme} className="p-2 rounded-full text-white hover:bg-white/20 transition-colors" title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                {showInstallButton && (
                    <button onClick={handleInstallClick} className="inline-flex cursor-pointer items-center gap-2 bg-white text-brand-primary font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                        <Download size={16} /> {t('install_app.cta', 'Install App')}
                    </button>
                )}
            </div>
            {/* Centered Brand */}
            <div className="justify-self-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white whitespace-nowrap">
                    {settings?.logos?.faviconUrl && <img src={settings.logos.faviconUrl} alt="Logo" className="h-8 w-8 rounded-md" />}
                    <span>{settings?.logos?.companyName || 'HNV Solutions'}</span>
                </Link>
            </div>
            {/* Right Items */}
            <div className="flex items-center gap-2 justify-self-end">
                <nav className="flex items-center gap-1"><NavLinksContent /></nav>
                <div className="w-px h-6 bg-white/50 mx-2"></div>
                <Link to="/login" className="font-semibold text-white hover:bg-white/20 px-4 py-2 rounded-md">{t('header.login')}</Link>
                <Link to="/register" className="flex items-center gap-2 font-bold text-brand-primary bg-white hover:bg-gray-100 py-2 px-5 rounded-lg transition-all">{t('header.get_started')} <ArrowRight size={16} /></Link>
            </div>
        </div>

        {/* Mobile Navbar: Flex layout */}
        <div className="lg:hidden flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white whitespace-nowrap">
                {settings?.logos?.faviconUrl && <img src={settings.logos.faviconUrl} alt="Logo" className="h-8 w-8 rounded-md" />}
            </Link>
            <Link to="/" className="text-xl font-bold text-white whitespace-nowrap">
                {settings?.logos?.companyName || 'HNV Solutions'}
            </Link>
            <Link to="/login" className="font-semibold text-white hover:text-gray-200">
                {t('header.login')}
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
