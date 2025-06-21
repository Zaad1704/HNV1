// frontend/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useTranslation } from 'react-i18next'; // Import useTranslation for i18n instance

// Define all supported languages with their codes and display names
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'es', name: 'Español' }, // Example from localizationController
  { code: 'de', name: 'Deutsch' }, // Example from localizationController
  { code: 'hi', name: 'हिन्दी' },   // Example from localizationController
];

type Lang = typeof SUPPORTED_LANGUAGES[number]['code']; // Type for language codes

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  // Expose SUPPORTED_LANGUAGES for easy access in components
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  getNextLanguage: () => { code: Lang; name: string };
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
  const { i18n } = useTranslation(); // Get i18n instance from react-i18next
  
  const [lang, setLangState] = useState<Lang>(() => {
    // Try to load persisted language first
    const persistedLang = localStorage.getItem("preferredLang");
    if (persistedLang && SUPPORTED_LANGUAGES.some(l => l.code === persistedLang)) {
        return persistedLang as Lang;
    }
    // Fallback to i18n's detected language if no preference or invalid preference
    return (i18n.language || 'en') as Lang;
  });

  useEffect(() => {
    // Ensure i18next's language matches our state and update HTML lang attribute
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  const setLanguage = (l: Lang) => { 
    setLangState(l);
  };

  const getNextLanguage = () => {
    const currentIndex = SUPPORTED_LANGUAGES.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGUAGES.length;
    return SUPPORTED_LANGUAGES[nextIndex];
  };

  return (
    <LangContext.Provider value={{ lang, setLang: setLanguage, supportedLanguages: SUPPORTED_LANGUAGES, getNextLanguage }}>
      {children}
    </LangContext.Provider>
  );
};
