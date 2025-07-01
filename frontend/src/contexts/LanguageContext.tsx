import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  getNextToggleLanguage: () => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const toggleLanguages = ['en', 'es', 'fr', 'de', 'zh'];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLangState] = useState(i18n.language || 'en');

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('language', newLang);
  };

  const getNextToggleLanguage = () => {
    const currentIndex = toggleLanguages.indexOf(lang);
    const nextIndex = (currentIndex + 1) % toggleLanguages.length;
    return toggleLanguages[nextIndex];
  };

  const toggleLanguage = () => {
    const nextLang = getNextToggleLanguage();
    setLang(nextLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, getNextToggleLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLang must be used within a LanguageProvider');
  }
  return context;
};