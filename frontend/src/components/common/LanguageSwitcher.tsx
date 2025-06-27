import React, { useState } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useLang, allLanguages } from '../../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang, availableLanguages, getNextToggleLanguage } = useLang();
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const handleQuickToggle = () => {
    const nextLang = getNextToggleLanguage();
    setLang(nextLang.code);
  };

  const handleLanguageSelect = (langCode: string) => {
    setLang(langCode);
    setShowAllLanguages(false);
  };

  const currentLanguage = availableLanguages.find(l => l.code === lang) || availableLanguages[0];

  return (
    <div className="relative">
      {/* Quick Toggle Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleQuickToggle}
          className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          title={`Switch to ${getNextToggleLanguage().name}`}
        >
          <span>{currentLanguage.name}</span>
        </button>
        
        {/* Globe Icon for All Languages */}
        <button
          onClick={() => setShowAllLanguages(!showAllLanguages)}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          title="All Languages"
        >
          <GlobeAltIcon className="h-5 w-5" />
        </button>
      </div>

      {/* All Languages Dropdown */}
      {showAllLanguages && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
              All Languages
            </div>
            {allLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  lang === language.code 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{language.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language.currency}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showAllLanguages && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAllLanguages(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;