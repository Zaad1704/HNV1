import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';
import SmartLanguageSwitcher from '../common/SmartLanguageSwitcher';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useAuthStore } from '../../store/authStore';

interface MobileHeaderProps {
  onMenuToggle?: () => void;
  showNotifications?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle, showNotifications = false }) => {
  const { data: settings } = useSiteSettings();
  const { user } = useAuthStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu/Logo */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo-min.png" 
              alt="HNV Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              {settings?.logos?.companyName?.split(' ')[0] || 'HNV'}
            </span>
          </Link>
        </div>

        {/* Right: Language Switcher + Notifications + Profile */}
        <div className="flex items-center gap-2">
          <div className="scale-75 origin-right">
            <SmartLanguageSwitcher />
          </div>
          
          {showNotifications && (
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Bell size={18} className="text-gray-700 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          )}
          
          {user && (
            <Link 
              to="/dashboard/settings"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User size={18} className="text-gray-700 dark:text-gray-300" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;