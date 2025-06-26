import React, { createContext, useContext, useState } from 'react';

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  currencyName: string;
  getNextToggleLanguage: () => { code: string; name: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = [
  { code: 'en', name: 'English', currency: '$' },
  { code: 'bn', name: 'বাংলা', currency: '৳' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState('en');
  
  const currentLang = languages.find(l => l.code === lang) || languages[0];
  
  const getNextToggleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex];
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      currencyName: currentLang.currency,
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