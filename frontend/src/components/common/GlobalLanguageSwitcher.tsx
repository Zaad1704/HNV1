import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang, languages } from '../../contexts/LanguageContext';

const GlobalLanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang } = useLang();
  const { t } = useTranslation();

  const currentLanguage = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-surface transition-colors"
        aria-label={t('common.change_language')}
      >
        <Globe size={18} />
        <span className="hidden sm:inline text-sm font-medium">
          {currentLanguage.nativeName}
        </span>
        <span className="sm:hidden text-sm">
          {currentLanguage.flag}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-app-surface border border-app-border rounded-xl shadow-app-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-text-muted px-3 py-2 uppercase tracking-wide">
                {t('common.select_language')}
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLang(language.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    lang === language.code
                      ? 'bg-brand-blue/10 text-brand-blue'
                      : 'hover:bg-app-bg text-text-primary'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-text-muted">{language.name}</div>
                  </div>
                  {lang === language.code && (
                    <div className="w-2 h-2 bg-brand-blue rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalLanguageSwitcher;