// frontend/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client'; // RE-ADDED: import apiClient

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

// REMOVED: initialLocaleData prop from LangProviderProps
export const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => { 
  const { i18n } = useTranslation();
  
  const [lang, setLangState] = useState<LangCode>(() => {
    const persistedLang = localStorage.getItem("preferredLang") as LangCode;
    if (persistedLang && ALL_SUPPORTED_LANGUAGES_MAP[persistedLang]) {
        return persistedLang;
    }
    // Fallback to i18n's detected language, then 'en'
    return (ALL_SUPPORTED_LANGUAGES_MAP[i18n.language as LangCode] ? i18n.language : 'en') as LangCode;
  });

  // RE-ADDED: State for currency and fetch logic
  const [currencyInfo, setCurrencyInfo] = useState({ code: 'USD', name: '$' });

  useEffect(() => {
    // Sync i18n and persist language
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  useEffect(() => {
    // RE-ADDED: Fetch detected locale/currency from backend
    const fetchLocale = async () => {
      try {
        const { data } = await apiClient.get('/localization/detect');
        setCurrencyInfo({
          code: data.currency || 'USD',
          name: data.currency === 'BDT' ? '৳' : '$' // Assign symbol based on code
        });
        i18n.changeLanguage(data.lang); // Also update i18n language based on detection
      } catch (error) {
        console.error('Failed to detect locale in LanguageContext:', error);
        setCurrencyInfo({ code: 'USD', name: '$' });
        i18n.changeLanguage('en'); // Fallback language
      }
    };
    fetchLocale();
  }, []); // Run once on mount

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
