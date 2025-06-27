import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface DashboardHeaderProps {
  user: any;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    // Check current theme
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Fetch organization details
    const fetchOrganization = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orgs/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.name) {
            setOrganizationName(data.data.name);
          }
        }
      } catch (error) {
        console.error('Failed to fetch organization:', error);
      }
    };

    if (user?.organizationId) {
      fetchOrganization();
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const getWelcomeMessage = () => {
    if (organizationName) {
      return `${t('dashboard.welcome_back')}, ${organizationName}!`;
    }
    return `${t('dashboard.welcome_back')}, ${user?.name || 'User'}!`;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Welcome message */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getWelcomeMessage()}
            </h1>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <UserCircleIcon className="h-8 w-8" />
                <span className="hidden md:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              {t('dashboard.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
