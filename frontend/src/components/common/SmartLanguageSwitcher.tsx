import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLang, languages } from '../../contexts/LanguageContext';

const SmartLanguageSwitcher = () => {
  const { lang, setLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(l => l.code === lang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-glass flex items-center gap-2 px-3 py-2 rounded-full"
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-app-surface border border-app-border rounded-2xl shadow-app-lg py-2 min-w-48 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLang(language.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-app-bg transition-colors ${
                lang === language.code ? 'bg-app-bg text-brand-blue' : 'text-text-primary'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartLanguageSwitcher;