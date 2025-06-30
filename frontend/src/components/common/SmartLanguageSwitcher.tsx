import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLang, languages } from '../../contexts/LanguageContext';

const SmartLanguageSwitcher = () => {
  const { lang, detectedLang, toggleLanguage, setLang } = useLang();
  const [showAll, setShowAll] = useState(false);
  
  const currentLanguage = languages.find(l => l.code === lang);
  const localLanguage = languages.find(l => l.code === detectedLang);

  return (
    <div className="flex items-center gap-1">
      {/* Quick toggle - always show */}
      <button
        onClick={toggleLanguage}
        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors flex items-center gap-1"
        title={`Switch to ${lang === 'en' ? (localLanguage?.name || 'Local') : 'English'}`}
      >
        {lang === 'en' ? (localLanguage?.flag || '🌐') : '🇺🇸'}
        <span className="hidden sm:inline">{lang === 'en' ? (localLanguage?.code?.toUpperCase() || 'LOC') : 'EN'}</span>
      </button>

      {/* Globe for all languages */}
      <div className="relative">
        <button
          onClick={() => setShowAll(!showAll)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="All Languages"
        >
          <Globe size={16} />
        </button>

        {showAll && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowAll(false)} />
            <div 
              className="absolute top-full mt-2 w-48 md:w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] overflow-hidden max-h-80 overflow-y-auto"
              style={{
                right: 0,
                maxWidth: 'min(200px, calc(100vw - 2rem))',
                transform: 'translateX(calc(-100% + 1.5rem))'
              }}
            >
              <div className="p-1">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setLang(language.code);
                      setShowAll(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      lang === language.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{language.name}</div>
                      <div className="text-xs opacity-60">{language.nativeName}</div>
                    </div>
                    {lang === language.code && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartLanguageSwitcher;