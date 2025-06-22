import React, {
  createContext, useContext, useState, ReactNode, useEffect, useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";

export const ALL_SUPPORTED_LANGUAGES_MAP = {
  en: { code: "en", name: "English" },
  bn: { code: "bn", name: "বাংলা" },
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
    throw new Error("useLang must be used within a LangProvider");
  }
  return context;
};

export const LangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  const [lang, setLangState] = useState<LangCode>(() => {
    const persistedLang = localStorage.getItem("preferredLang") as LangCode;
    return (persistedLang && ALL_SUPPORTED_LANGUAGES_MAP[persistedLang]) ? persistedLang : "en";
  });

  // --- THIS IS THE KEY CHANGE ---
  // The currency information is now derived directly from the current language state.
  const currencyInfo = useMemo(() => {
    if (lang === 'bn') {
      return { code: 'BDT', name: '৳' };
    }
    // Default currency
    return { code: 'USD', name: '$' };
  }, [lang]);


  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  const toggleLanguages = useMemo(() => {
    return Object.values(ALL_SUPPORTED_LANGUAGES_MAP);
  }, []);

  const getNextToggleLanguage = () => {
    const currentIndex = toggleLanguages.findIndex((l) => l.code === lang);
    return toggleLanguages[(currentIndex + 1) % toggleLanguages.length];
  };

  const currentLanguageName = ALL_SUPPORTED_LANGUAGES_MAP[lang]?.name || "English";

  return (
    <LangContext.Provider
      value={{
        lang,
        setLang: setLangState,
        toggleLanguages,
        currentLanguageName,
        getNextToggleLanguage,
        currencyCode: currencyInfo.code,
        currencyName: currencyInfo.name,
      }}
    >
      {children}
    </LangContext.Provider>
  );
};
