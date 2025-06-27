import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { languages, useLang } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { lang, setLang } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-app-border transition-colors"
      >
        <Globe size={16} />
        <span className="text-sm">{languages.find(l => l.code === lang)?.name}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-app-surface border border-app-border rounded-lg shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLang(language.code);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-app-bg transition-colors"
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;