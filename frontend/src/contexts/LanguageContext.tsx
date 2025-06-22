// frontend/src/contexts/LanguageContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

// Define only the explicitly supported languages here.
export const ALL_SUPPORTED_LANGUAGES_MAP = {
  'en': { code: 'en', name: 'English' },
  'bn': { code: 'bn', name: 'বাংলা' },
};

type LangCode = keyof typeof ALL_SUPPORTED_LANGUAGES_MAP;
type LangOption = typeof ALL_SUPPORTED_LANGUAGES_MAP[LangCode];

interface LangContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  toggleLanguages: LangOption[];
  currentLanguageName: string;
  getNextToggleLanguage: () => LangOption;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
};

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();
  
  const [lang, setLangState] = useState<LangCode>(() => {
    const persistedLang = localStorage.getItem("preferredLang") as LangCode;
    if (persistedLang && ALL_SUPPORTED_LANGUAGES_MAP[persistedLang]) {
        return persistedLang;
    }
    return (ALL_SUPPORTED_LANGUAGES_MAP[i18n.language as LangCode] ? i18n.language : 'en') as LangCode;
  });

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  const toggleLanguages = useMemo(() => {
    const options: LangOption[] = [ALL_SUPPORTED_LANGUAGES_MAP['en']]; // English is always an option

    // If Bengali is supported and not already added (e.g., if it's the detected language)
    if (ALL_SUPPORTED_LANGUAGES_MAP['bn'] && !options.some(o => o.code === 'bn')) {
      options.push(ALL_SUPPORTED_LANGUAGES_MAP['bn']);
    }
    // Sort to ensure consistent order if needed (e.g., English always first, then Bengali)
    return options.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical by name or set preferred order
  }, []); // Depend only on initial ALL_SUPPORTED_LANGUAGES_MAP

  const setLanguage = (l: LangCode) => { 
    setLangState(l);
  };

  const getNextToggleLanguage = () => {
    const currentIndex = toggleLanguages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % toggleLanguages.length;
    return toggleLanguages[nextIndex];
  };

  const currentLanguageName = useMemo(() => {
    return ALL_SUPPORTED_LANGUAGES_MAP[lang]?.name || lang.toUpperCase();
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang: setLanguage, toggleLanguages, currentLanguageName, getNextToggleLanguage }}>
      {children}
    </LangContext.Provider>
  );
};
