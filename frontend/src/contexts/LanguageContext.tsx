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
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', currency: '$', currencyCode: 'USD' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', currency: '৳', currencyCode: 'BDT' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', currency: '€', currencyCode: 'EUR' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', currency: '€', currencyCode: 'EUR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', currency: '€', currencyCode: 'EUR' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', currency: '¥', currencyCode: 'JPY' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', currency: '¥', currencyCode: 'CNY' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', currency: '₹', currencyCode: 'INR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', currency: '$', currencyCode: 'USD' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', currency: 'R$', currencyCode: 'BRL' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  const { i18n } = useTranslation();
  
  const currentLang = languages.find(l => l.code === lang) || languages[0];
  
  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
  };
  
  const getNextToggleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex];
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

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