import React, { useState } from 'react';
import { Menu, Bell, Sun, Moon, Globe, Languages } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLang } from '../../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import SmartLanguageSwitcher from '../common/SmartLanguageSwitcher';
import NotificationsPanel from '../dashboard/NotificationsPanel';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  showNotifications?: boolean;
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  onMenuToggle, 
  showNotifications = false,
  title
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-gradient-to-r from-brand-orange/90 to-brand-blue/90 backdrop-blur-md border-b border-white/20 shadow-app">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Menu Button */}
          <button
            onClick={onMenuToggle}
            className="touch-target p-2 rounded-xl text-white hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Center: Company Name */}
          <h1 className="text-sm font-bold text-white truncate px-2">
            {title || t('app_name')}
          </h1>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Smart Language Switcher - Mobile Optimized */}
            <div className="relative">
              <SmartLanguageSwitcher />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="touch-target p-2 rounded-xl text-white hover:text-white hover:bg-white/20 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Notifications */}
            {showNotifications && <NotificationsPanel />}
          </div>
        </div>
      </header>


    </>
  );
};

export default MobileHeader;