// frontend/src/components/layout/Navbar.tsx
import React from 'react';
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

  return (
    <header className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-color/50 dark:border-border-color-dark/50">
      <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center">
        {/* Left-aligned Buttons */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setLang(getNextToggleLanguage().code)}
                className="p-2 rounded-full text-light-text hover:bg-light-bg dark:text-light-text-dark dark:hover:bg-dark-bg"
                title={`Switch to ${getNextToggleLanguage().name}`}
            >
                <Globe size={20} />
            </button>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-light-text hover:bg-light-bg dark:text-light-text-dark dark:hover:bg-dark-bg"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <ScrollLink to="install-app" smooth={true} offset={-80} duration={500} className="hidden sm:inline-flex cursor-pointer items-center gap-2 btn-dark font-semibold py-2 px-4 rounded-lg text-sm">
                <Download size={16} /> Install App
            </ScrollLink>
        </div>
        
        {/* Centered Website Name */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="text-xl font-bold text-dark-text dark:text-dark-text-dark whitespace-nowrap">
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
