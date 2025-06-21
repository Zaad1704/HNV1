// frontend/src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
// NOTE: useScrollSpy is now conditionally used only if necessary for desktop features nav in other layout
// import { useScrollSpy } from '../hooks/useScrollSpy'; // Not using directly in Navbar for this iteration
import { ArrowRight, Globe, Sun, Moon } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
// No need for useTranslation directly here as useLang context provides language state info

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { lang, setLang, currentLanguageName, getNextToggleLanguage, toggleLanguages } = useLang(); // Get all needed language context values
  const { theme, toggleTheme } = useTheme();

  // State to manage potential language switcher mini-dropdown (if we switch back to that style)
  // For now, it's a simple toggle button that cycles, so this state is not used directly.
  // const [isLangMenuOpen, setIsLangMenuOpen] = useState(false); 

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
    <header className="bg-brand-dark/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src={settings?.logos?.navbarLogoUrl || "/logo-min.png"} alt="Company Logo" className="h-10" />
          <span className="text-xl font-bold text-white sm:inline">
            {settings?.logos?.companyName || 'HNV Solutions'}
          </span>
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-2">
          <NavLinksContent />
          {/* Language Toggle for Desktop */}
          {toggleLanguages.length > 1 && ( // Only show language toggle if there's more than one language available
            <button 
              onClick={() => setLang(getNextToggleLanguage().code)} // Cycle to next language
              className="ml-4 flex items-center gap-1 p-2 bg-transparent border border-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-white"
              title={`Switch to ${getNextToggleLanguage().name}`}
            >
              <Globe size={16} /> {currentLanguageName}
            </button>
          )}
          {/* Theme Toggle for Desktop */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 bg-transparent border border-gray-600 text-white rounded-md text-sm hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-white"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </nav>
        
        <div className="hidden lg:flex items-center space-x-4">
          <Link to="/login" className="font-semibold text-white hover:text-gray-300">Portal Log In</Link>
          <Link to="/register" className="flex items-center gap-2 font-bold text-brand-dark bg-white hover:bg-gray-200 py-2 px-5 rounded-lg">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile-specific Header Links (simplified) */}
        {/* Sign Up only on header, Login only on bottom nav */}
        <div className="lg:hidden flex items-center space-x-4">
            {toggleLanguages.length > 1 && ( // Only show language toggle if more than one language
              <button 
                onClick={() => setLang(getNextToggleLanguage().code)} // Cycle to next language
                className="p-1 bg-transparent border border-gray-600 text-white rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-white flex items-center gap-1"
                title={`Switch to ${getNextToggleLanguage().name}`}
              >
                <Globe size={14} /> {lang.toUpperCase()}
              </button>
            )}
            {/* Theme Toggle for Mobile Header */}
            <button
              onClick={toggleTheme}
              className="p-1 bg-transparent border border-gray-600 text-white rounded-md text-xs hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-white"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            {/* ONLY Sign Up on header for mobile */}
            <Link to="/register" className="font-bold text-brand-dark bg-white hover:bg-gray-200 py-1.5 px-3 rounded-lg text-sm">
                Sign Up
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
