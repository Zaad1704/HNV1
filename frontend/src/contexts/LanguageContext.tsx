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
    if (persistedLang && ALL_SUPPORTED_LANGUAGES_MAP[persistedLang]) {
      return persistedLang;
    }
    return (ALL_SUPPORTED_LANGUAGES_MAP[i18n.language as LangCode]
      ? i18n.language
      : "en") as LangCode;
  });

  const [currencyInfo, setCurrencyInfo] = useState({ code: "USD", name: "$" });

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  useEffect(() => {
    // Only auto-detect if no user preference
    if (!localStorage.getItem("preferredLang")) {
      const fetchLocale = async () => {
        try {
          const { data } = await apiClient.get("/localization/detect");
          setCurrencyInfo({
            code: data.currency || "USD",
            name: data.currency === "BDT" ? "৳" : "$",
          });
          setLangState(data.lang);
        } catch (error) {
          setCurrencyInfo({ code: "USD", name: "$" });
          setLangState("en");
        }
      };
      fetchLocale();
    }
  }, []);

  const toggleLanguages = useMemo(() => {
    const options: LangOption[] = [ALL_SUPPORTED_LANGUAGES_MAP["en"]];
    if (
      ALL_SUPPORTED_LANGUAGES_MAP["bn"] &&
      !options.some((o) => o.code === "bn")
    ) {
      options.push(ALL_SUPPORTED_LANGUAGES_MAP["bn"]);
    }
    return options;
  }, []);

  const getNextToggleLanguage = () => {
    const idx = toggleLanguages.findIndex((l) => l.code === lang);
    return toggleLanguages[(idx + 1) % toggleLanguages.length];
  };

  const currentLanguageName =
    ALL_SUPPORTED_LANGUAGES_MAP[lang]?.name || "English";

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
