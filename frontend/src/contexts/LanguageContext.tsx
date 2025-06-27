import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  currencyName: string;
  currencyCode: string;
  getNextToggleLanguage: () => { code: string; name: string; currency: string; currencyCode: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = [
  { code: 'en', name: 'English', currency: '$', currencyCode: 'USD' },
  { code: 'bn', name: 'বাংলা', currency: '৳', currencyCode: 'BDT' },
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }, [lang, i18n]);

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
  };

  const getNextToggleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex];
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang: handleSetLang,
      currencyName: currentLang.currency,
      currencyCode: currentLang.currencyCode,
      getNextToggleLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLang must be used within LanguageProvider');
  }
  return context;
};

export { languages };