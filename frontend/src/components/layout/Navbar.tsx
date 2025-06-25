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
          className="font-medium transition-colors duration-150 rounded-md px-3 py-2 text-light-text hover:text-dark-text dark:text-light-text-dark dark:hover:text-dark-text-dark"
        >
          {t(link.key)}
        </a>
      ))}
    </>
  );

  return (
    <header className="bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-border-color/50 dark:border-border-color-dark/50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative"> {/* Added relative for positioning */}
        {/* Left Aligned (for mobile/tablet fallback or specific items) */}
        <div className="flex-shrink-0 lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2">
            {/* Removed direct logo/name link, can add a minimal "Login" button for mobile only */}
        </div>
        
        {/* Centered Logo and Company Name (Desktop) */}
        <div className="flex-grow flex justify-center items-center"> {/* Centered content */}
            <Link to="/" className="flex items-center space-x-3">
                <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="HNV Logo" className="h-10" width="40" height="40" />
                <span className="text-xl font-bold text-dark-text dark:text-dark-text-dark sm:inline">
                    {settings?.logos?.companyName || 'HNV Solutions'}
                </span>
            </Link>
        </div>

        {/* Right Aligned Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-2 flex-shrink-0 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
            <nav className="flex items-center gap-1">
                <NavLinksContent />
            </nav>

            <div className="w-px h-6 bg-border-color/50 dark:bg-border-color-dark/50 mx-2"></div>
            
            <button 
                onClick={() => setLang(getNextToggleLanguage().code)}
                className="p-2 rounded-md text-light-text dark:text-light-text-dark hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-150"
                title={`Switch to ${getNextToggleLanguage().name}`}
            >
                <Globe size={18} />
            </button>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-light-text dark:text-light-text-dark hover:bg-light-bg dark:hover:bg-dark-bg transition-colors duration-150"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            <Link to="/login" className="font-semibold text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark px-4 py-2 rounded-md transition-colors duration-150">
                {t('header.login')}
            </Link>
            <Link to="/register" className="flex items-center gap-2 font-bold bg-brand-primary text-white hover:bg-brand-secondary py-2 px-5 rounded-lg transition-all duration-200">
                {t('header.get_started')} <ArrowRight size={16} />
            </Link>
        </div>

        {/* Mobile-specific buttons (shown on small screens) */}
        <div className="lg:hidden flex items-center space-x-3">
             <Link to="/login" className="font-semibold text-light-text dark:text-light-text-dark hover:text-dark-text dark:hover:text-dark-text-dark rounded-md transition-colors duration-150">
                {t('header.login')}
            </Link>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
