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