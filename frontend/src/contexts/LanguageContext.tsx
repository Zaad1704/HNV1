// frontend/src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';

// Define all *potential* supported languages that the system knows about.
// These are not necessarily the ones shown in the toggle, but are available for detection/internal logic.
export const ALL_SUPPORTED_LANGUAGES_MAP = {
  'en': { code: 'en', name: 'English' },
  'bn': { code: 'bn', name: 'বাংলা' },
  'es': { code: 'es', name: 'Español' },
  'de': { code: 'de', name: 'Deutsch' },
  'hi': { code: 'hi', name: 'हिन्दी' },
  'fr': { code: 'fr', name: 'Français' }, // Added French
};

type LangCode = keyof typeof ALL_SUPPORTED_LANGUAGES_MAP; // Type for language codes
type LangOption = typeof ALL_SUPPORTED_LANGUAGES_MAP[LangCode]; // Type for a single language option

interface LangContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  // Expose the currently available languages for the toggle (detected + English)
  toggleLanguages: LangOption[];
  // Get the display name of the current language
  currentLanguageName: string; // Add current language name for display
  getNextToggleLanguage: () => LangOption; // Get the next language to toggle to
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
    // Fallback to i18n's detected language (from localizationController)
    // or 'en' if i18n.language is not yet set or invalid.
    return (ALL_SUPPORTED_LANGUAGES_MAP[i18n.language as LangCode] ? i18n.language : 'en') as LangCode;
  });

  // Use useEffect to keep i18n instance in sync with our state
  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  // Determine the languages available for the toggle based on the current detected language
  const toggleLanguages = useMemo(() => {
    const detectedInitialLang = (i18n.language || 'en') as LangCode; // The language i18n is currently using (from IP detection on load)
    const options: LangOption[] = [ALL_SUPPORTED_LANGUAGES_MAP['en']]; // English is always an option

    if (detectedInitialLang !== 'en' && ALL_SUPPORTED_LANGUAGES_MAP[detectedInitialLang]) {
      // If the initially detected language is not English, add it as the primary toggle option
      options.unshift(ALL_SUPPORTED_LANGUAGES_MAP[detectedInitialLang]);
    }
    // Filter out duplicates if 'en' was already added or if the detected language is 'en'
    return Array.from(new Set(options.map(o => o.code))).map(code => ALL_SUPPORTED_LANGUAGES_MAP[code]);
  }, [i18n.language]); // Recalculate if i18n's detected language changes

  const setLanguage = (l: LangCode) => { 
    setLangState(l);
  };

  const getNextToggleLanguage = () => {
    // Find the current language in the simplified toggleLanguages array
    const currentIndex = toggleLanguages.findIndex(l => l.code === lang);
    // Cycle to the next language in this array
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
