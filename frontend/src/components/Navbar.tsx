// frontend/src/components/Navbar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ArrowRight, Globe, Sun, Moon } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { lang, setLang, getNextToggleLanguage, currentLanguageName } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation links defined with their target section IDs
  const navLinks = [
    { key: 'header.features', href: '#featuresPage' },
    { key: 'header.about', href: '#about' },
    { key: 'header.pricing', href: '#pricingSection' },
    { key: 'header.contact', href: '#contact' },
  ];

  // --- SOLUTION: Corrected scroll/navigation handler ---
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1); // Remove the '#' from the href

    // If we are not on the landing page, navigate there first with the hash
    if (location.pathname !== '/') {
        navigate(`/${href}`);
    } else {
        // If we are already on the landing page, just scroll smoothly
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  };

  // Component for the desktop navigation links
  const NavLinksContent = () => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.key}
          href={link.href}
          onClick={(e) => handleScroll(e, link.href)}
          className="font-medium transition-colors rounded-md px-3 py-2 text-dark-text hover:text-brand-primary"
        >
          {t(link.key)}
        </a>
      ))}
    </>
  );

  return (
    <header className="bg-brand-dark/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo and Company Name */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="HNV Logo" className="h-10" width="40" height="40" />
          <span className="text-xl font-bold text-dark-text sm:inline"> {/* text-dark-text now maps to light color */}
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          <NavLinksContent />
          <button 
            onClick={() => setLang(getNextToggleLanguage().code)}
            className="ml-4 flex items-center gap-1 p-2 bg-transparent border border-border-color text-dark-text rounded-md text-sm hover:bg-brand-secondary" // Adjusted for new dark theme contrast
            title={`Switch to ${getNextToggleLanguage().name}`}
          >
            <Globe size={16} /> {lang.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 bg-transparent border border-border-color text-dark-text rounded-md text-sm hover:bg-brand-secondary" // Adjusted for new dark theme contrast
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </nav>
        
        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login" className="font-semibold text-dark-text hover:text-brand-primary"> {/* text-dark-text now maps to light color */}
            {t('header.login')}
          </Link>
          <Link to="/register" className="flex items-center gap-2 font-bold text-brand-dark bg-dark-text hover:bg-brand-secondary py-2 px-5 rounded-lg"> {/* text-brand-dark bg-white --> text-brand-dark bg-dark-text (text-dark-text now maps to a light color) */}
            {t('header.get_started')} <ArrowRight size={16} />
          </Link>
        </div>

        {/* FIX: Mobile Header Controls Implemented */}
        <div className="lg:hidden flex items-center space-x-3">
            <button 
              onClick={() => setLang(getNextToggleLanguage().code)}
              className="p-1 bg-transparent border border-border-color text-dark-text rounded-md text-xs focus:outline-none flex items-center gap-1" // Adjusted for new dark theme contrast
              title={`Switch to ${getNextToggleLanguage().name}`}
            >
              <Globe size={14} /> {lang.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1 bg-transparent border border-border-color text-dark-text rounded-md text-xs hover:bg-brand-secondary focus:outline-none" // Adjusted for new dark theme contrast
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <Link to="/register" className="font-bold text-dark-text bg-brand-primary hover:bg-brand-dark py-2 px-4 rounded-lg text-sm shadow-md transition-colors flex items-center gap-1"> {/* text-dark-text now maps to light color */}
                <span>{t('header.sign_up')}</span>
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
