import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { Globe, Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import { useLang } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="app-gradient sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
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
            <span>
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

        {/* Mobile Layout - Native App Style */}
        <div className="md:hidden flex items-center justify-between">
          {/* Left: Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="btn-glass p-3 rounded-full"
          >
            <Menu size={20} />
          </button>

          {/* Center: Brand - Optimized for mobile */}
          <Link to="/" className="flex items-center gap-2 text-white">
            {settings?.logos?.faviconUrl && (
              <img 
                src={settings.logos.faviconUrl} 
                alt="Logo" 
                className="h-8 w-8 rounded-lg" 
              />
            )}
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold truncate max-w-[140px]">
                {settings?.logos?.companyName || 'HNV Solutions'}
              </span>
              <span className="text-xs text-white/70">Property Management</span>
            </div>
          </Link>

          {/* Right: Get Started - Compact */}
          <Link 
            to="/register" 
            className="btn-glass px-4 py-2 rounded-full text-sm font-semibold"
          >
            {t('header.get_started')}
          </Link>
        </div>
      </div>

      {/* Mobile Menu Modal - Native App Style */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50">
          <div className="bg-app-surface h-full w-80 max-w-[85vw] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-app-border">
              <div className="flex items-center gap-3">
                {settings?.logos?.faviconUrl && (
                  <img 
                    src={settings.logos.faviconUrl} 
                    alt="Logo" 
                    className="h-10 w-10 rounded-xl" 
                  />
                )}
                <div>
                  <h2 className="text-lg font-bold text-text-primary">
                    {settings?.logos?.companyName || 'HNV Solutions'}
                  </h2>
                  <p className="text-sm text-text-secondary">Property Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-4">
              <button 
                onClick={() => {
                  setLang(getNextToggleLanguage().code);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                <Globe size={24} className="text-brand-blue" />
                <div className="text-left">
                  <p className="font-semibold text-text-primary">Language</p>
                  <p className="text-sm text-text-secondary">Switch to {getNextToggleLanguage().name}</p>
                </div>
              </button>

              <button 
                onClick={() => {
                  toggleTheme();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                {theme === 'light' ? <Moon size={24} className="text-brand-blue" /> : <Sun size={24} className="text-brand-blue" />}
                <div className="text-left">
                  <p className="font-semibold text-text-primary">Theme</p>
                  <p className="text-sm text-text-secondary">Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</p>
                </div>
              </button>

              <Link 
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">→</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary">{t('header.login')}</p>
                  <p className="text-sm text-text-secondary">Access your account</p>
                </div>
              </Link>

              <Link 
                to="/register"
                onClick={() => setShowMobileMenu(false)}
                className="w-full btn-gradient p-4 rounded-2xl text-center font-semibold text-white"
              >
                {t('header.get_started')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;