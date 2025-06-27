import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLang, languages } from '../../contexts/LanguageContext';
import { useIPLocation } from '../../hooks/useIPLocation';

const SmartLanguageSwitcher = () => {
  const { lang, setLang } = useLang();
  const { location, isLoading } = useIPLocation();
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');

  useEffect(() => {
    if (location && !isLoading) {
      setDetectedLanguage(location.language);
      
      // Auto-set language on first visit if not already set
      const hasSetLanguage = localStorage.getItem('hasSetLanguage');
      if (!hasSetLanguage && location.language !== 'en') {
        setLang(location.language);
        localStorage.setItem('hasSetLanguage', 'true');
      }
    }
  }, [location, isLoading, setLang]);

  const toggleBetweenMainLanguages = () => {
    const newLang = lang === 'en' ? detectedLanguage : 'en';
    setLang(newLang);
    localStorage.setItem('hasSetLanguage', 'true');
  };

  const selectLanguage = (langCode: string) => {
    setLang(langCode);
    setShowAllLanguages(false);
    localStorage.setItem('hasSetLanguage', 'true');
  };

  const currentLanguage = languages.find(l => l.code === lang);
  const localLanguage = languages.find(l => l.code === detectedLanguage);

  return (
    <div className="flex items-center gap-2">
      {/* Quick toggle between English and local language */}
      {detectedLanguage !== 'en' && (
        <button
          onClick={toggleBetweenMainLanguages}
          className="btn-glass px-3 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform"
          title={`Switch to ${lang === 'en' ? localLanguage?.name : 'English'}`}
        >
          {lang === 'en' ? localLanguage?.flag : '🇺🇸'} {lang === 'en' ? localLanguage?.code.toUpperCase() : 'EN'}
        </button>
      )}

      {/* Globe for all languages */}
      <div className="relative">
        <button
          onClick={() => setShowAllLanguages(!showAllLanguages)}
          className="btn-glass p-3 rounded-full hover:scale-110 transition-transform"
          title="All Languages"
        >
          <Globe size={20} />
        </button>

        {showAllLanguages && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-app-surface border border-app-border rounded-2xl shadow-app-xl z-50 overflow-hidden">
            <div className="p-2">
              <div className="text-xs text-text-muted p-2 border-b border-app-border">
                Choose Language
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => selectLanguage(language.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-app-bg transition-colors ${
                    lang === language.code ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-primary'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs text-text-secondary">{language.nativeName}</div>
                  </div>
                  {lang === language.code && (
                    <div className="ml-auto w-2 h-2 bg-brand-blue rounded-full"></div>
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
