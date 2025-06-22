// frontend/src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ArrowRight, Globe, Sun, Moon } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { lang, setLang, currentLanguageName, getNextToggleLanguage, toggleLanguages } = useLang();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Features', href: '/#featuresPage' },
    { name: 'About', href: '/#aboutPage' },
    { name: 'Pricing', href: '/#pricingSection' },
    { name: 'Contact', href: '/#contact' },
  ];
  
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith('/#')) {
        e.preventDefault();
        const targetId = href.substring(2);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  const NavLinksContent = () => (
    <>
      {navLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          onClick={(e) => handleScroll(e, link.href)}
          className={`font-medium transition-colors rounded-md px-3 py-2 text-gray-300 hover:text-white`}
        >
          {link.name}
        </a>
      ))}
    </>
  );

  return (
    <header className="bg-brand-dark/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 dark:bg-dark-card/80"> {/* Added dark mode classes */}
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" />
          <span className="text-xl font-bold text-white sm:inline dark:text-dark-text-dark"> {/* Added dark mode class */}
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-2">
          <NavLinksContent />
          {/* Language Toggle for Desktop */}
          {toggleLanguages.length > 1 && (
            <button 
              onClick={() => setLang(getNextToggleLanguage().code)}
              className="ml-4 flex items-center gap-1 p-2 bg-transparent border border-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-white dark:border-border-color-dark dark:text-light-text-dark dark:hover:bg-slate-700"
              title={`Switch to ${getNextToggleLanguage().name}`}
            >
              <Globe size={16} /> {currentLanguageName}
            </button>
          )}
          {/* Theme Toggle for Desktop */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 bg-transparent border border-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-white dark:border-border-color-dark dark:text-light-text-dark dark:hover:bg-slate-700"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </nav>
        
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login" className="font-semibold text-white hover:text-gray-300 dark:text-light-text-dark dark:hover:text-slate-300">Portal Log In</Link>
          <Link to="/register" className="flex items-center gap-2 font-bold text-brand-dark bg-white hover:bg-gray-200 py-2 px-5 rounded-lg">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile-specific Header Links (simplified) */}
        <div className="lg:hidden flex items-center space-x-3"> {/* Adjusted space-x for better mobile look */}
            {toggleLanguages.length > 1 && (
              <button 
                onClick={() => setLang(getNextToggleLanguage().code)}
                className="p-1 bg-transparent border border-gray-600 text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-white flex items-center gap-1 dark:border-border-color-dark dark:text-light-text-dark"
                title={`Switch to ${getNextToggleLanguage().name}`}
              >
                <Globe size={14} /> {lang.toUpperCase()}
              </button>
            )}
            {/* Theme Toggle for Mobile Header */}
            <button
              onClick={toggleTheme}
              className="p-1 bg-transparent border border-gray-600 text-white rounded-md text-xs hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-white dark:border-border-color-dark dark:text-light-text-dark dark:hover:bg-slate-700"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            {/* ONLY Sign Up on header for mobile - Redesigned */}
            <Link to="/register" className="font-bold text-white bg-brand-primary hover:bg-brand-dark py-2 px-4 rounded-lg text-sm shadow-md transition-colors flex items-center gap-1"> {/* Adjusted padding and added shadow */}
                <span>{t('header.sign_up')}</span> {/* Using translation for signup text */}
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
