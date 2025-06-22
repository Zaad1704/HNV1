// frontend/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
// Removed: import apiClient from '../api/client'; // apiClient is now passed from App.tsx

// Define all *potential* supported languages that the system knows about.
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
  currencyCode: string;
  currencyName: string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
};

// NEW: Accept initialLocaleData prop
interface LangProviderProps {
  children: ReactNode;
  initialLocaleData: { lang: string; currency: string; name: string; };
}

export const LangProvider: React.FC<LangProviderProps> = ({ children, initialLocaleData }) => {
  const { i18n } = useTranslation();
  
  const [lang, setLangState] = useState<LangCode>(() => {
    const persistedLang = localStorage.getItem("preferredLang") as LangCode;
    if (persistedLang && ALL_SUPPORTED_LANGUAGES_MAP[persistedLang]) {
        return persistedLang;
    }
    // Use initialLocaleData.lang if available, otherwise default to 'en'
    return (ALL_SUPPORTED_LANGUAGES_MAP[initialLocaleData.lang as LangCode] ? initialLocaleData.lang : 'en') as LangCode;
  });

  // NEW: Initialize currencyInfo from initialLocaleData
  const [currencyInfo, setCurrencyInfo] = useState({ 
    code: initialLocaleData.currency || 'USD', 
    name: initialLocaleData.name || '$' 
  }); 

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  // Removed: useEffect that fetched locale data from apiClient

  const toggleLanguages = useMemo(() => {
    const options: LangOption[] = [ALL_SUPPORTED_LANGUAGES_MAP['en']];

    if (ALL_SUPPORTED_LANGUAGES_MAP['bn'] && !options.some(o => o.code === 'bn')) {
      options.push(ALL_SUPPORTED_LANGUAGES_MAP['bn']);
    }
    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

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
    <LangContext.Provider value={{ 
        lang, setLang: setLanguage, toggleLanguages, currentLanguageName, getNextToggleLanguage,
        currencyCode: currencyInfo.code, 
        currencyName: currencyInfo.name 
    }}>
      {children}
    </LangContext.Provider>
  );
};
