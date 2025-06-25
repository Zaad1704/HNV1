// frontend/src/components/layout/Navbar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Globe, Sun, Moon, Search } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md sticky top-0 z-50 border-b border-border-color/50 dark:border-border-color-dark/50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
            <img src="/logo-min.png" alt="Company Logo" className="h-10 w-10" />
            <span className="text-xl font-bold text-dark-text dark:text-dark-text-dark">
                {settings?.logos?.companyName || 'HNV Solutions'}
            </span>
        </Link>

        <div className="flex items-center gap-4">
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
            <Link to="/login" className="btn-dark font-semibold py-2 px-5 rounded-lg text-sm">Login</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
