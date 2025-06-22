// frontend/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client'; // Import apiClient

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
  currencyCode: string; // NEW: Detected currency code (e.g., 'USD', 'BDT')
  currencyName: string; // NEW: Currency symbol/name (e.g., '$', '৳')
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

  const [currencyInfo, setCurrencyInfo] = useState({ code: 'USD', name: '$' }); // NEW: State for currency

  useEffect(() => {
    // --- Existing: Sync i18n and persist language ---
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  useEffect(() => {
    // --- NEW: Fetch detected locale/currency from backend ---
    const fetchLocale = async () => {
      try {
        const { data } = await apiClient.get('/localization/detect'); // Your backend endpoint
        setCurrencyInfo({
          code: data.currency || 'USD',
          name: data.currency === 'BDT' ? '৳' : '$' // Assign symbol based on code
        });
        // Optionally, if the backend detection determines a different lang, you could change i18n here
        // i18n.changeLanguage(data.lang); // Or use this for initial detection from backend
      } catch (error) {
        console.error('Failed to detect locale:', error);
        // Fallback to default USD if detection fails
        setCurrencyInfo({ code: 'USD', name: '$' });
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
        currencyCode: currencyInfo.code, // NEW: Provide currency code
        currencyName: currencyInfo.name // NEW: Provide currency name/symbol
    }}>
      {children}
    </LangContext.Provider>
  );
};
