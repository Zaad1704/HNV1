import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLang, languages } from '../../contexts/LanguageContext';

const SmartLanguageSwitcher = () => {
  const { lang, detectedLang, toggleLanguage, setLang } = useLang();
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentLanguage = languages.find(l => l.code === lang);
  const localLanguage = languages.find(l => l.code === detectedLang);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAll(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2" ref={dropdownRef}>
      {/* Always visible toggle button */}
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200 text-sm font-medium shadow-sm backdrop-blur-sm"
        title={`Switch to ${lang === 'en' ? (localLanguage?.name || 'Spanish') : 'English'}`}
      >
        <span className="text-base">{lang === 'en' ? (localLanguage?.flag || '🇪🇸') : '🇺🇸'}</span>
        <span className="font-bold">{lang === 'en' ? (localLanguage?.code?.toUpperCase() || 'ES') : 'EN'}</span>
      </button>

      {/* Globe dropdown for all languages */}
      <div className="relative">
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all duration-200 shadow-sm backdrop-blur-sm"
          title="All Languages"
        >
          <Globe size={18} className="text-white" />
          <ChevronDown size={14} className={`text-white transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
        </button>

        {showAll && (
          <div 
            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] overflow-hidden max-h-80 overflow-y-auto"
            style={{
              maxWidth: 'min(256px, calc(100vw - 2rem))'
            }}
          >
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700 mb-1">
                Select Language
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLang(language.code);
                    setShowAll(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    lang === language.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200 dark:ring-blue-800' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
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
        )}
      </div>
    </div>
  );
};

export default SmartLanguageSwitcher;