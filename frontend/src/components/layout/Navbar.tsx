import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { ArrowRight, Globe, Sun, Moon } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { lang, setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { key: 'header.features', href: '#featuresPage' },
    { key: 'header.about', href: '#about' },
    { key: 'header.pricing', href: '#pricingSection' },
    { key: 'header.contact', href: '#contact' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);

    if (location.pathname !== '/') {
        navigate(`/${href}`);
    } else {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  };

  const NavLinksContent = () => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.key}
          href={link.href}
          onClick={(e) => handleScroll(e, link.href)}
          className="font-medium transition-colors rounded-md px-3 py-2 text-light-text hover:text-dark-text"
        >
          {t(link.key)}
        </a>
      ))}
    </>
  );

  return (
    <header className="bg-brand-dark/30 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-border-color/20">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="HNV Logo" className="h-10" width="40" height="40" />
          <span className="text-xl font-bold text-dark-text sm:inline">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-1">
                <NavLinksContent />
            </nav>
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
            <Link to="/register" className="flex items-center gap-2 font-bold text-dark-text bg-brand-accent-light hover:bg-opacity-90 py-2 px-5 rounded-lg transition-all">
                {t('header.get_started')} <ArrowRight size={16} />
            </Link>
        </div>

        {/* FIX: Replaced "Login" text with a "Sign Up" button for mobile view */}
        <div className="lg:hidden flex items-center space-x-3">
             <Link to="/register" className="font-semibold text-sm text-dark-text bg-brand-accent-light hover:bg-opacity-90 py-2 px-4 rounded-lg transition-all">
                {t('header.sign_up')}
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
