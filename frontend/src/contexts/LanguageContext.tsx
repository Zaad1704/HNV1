import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  lang: string;
  detectedLang: string;
  setLang: (lang: string) => void;
  toggleLanguage: () => void;
  getNextToggleLanguage: () => { code: string; name: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState('en');
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLang(savedLang);
    setDetectedLang(savedLang);
    i18n.changeLanguage(savedLang);
  }, [i18n]);
  
  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    setDetectedLang(newLang);
    localStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
  };
  
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    handleSetLang(newLang);
  };
  
  const getNextToggleLanguage = () => {
    if (lang === 'en') {
      return languages.find(l => l.code === 'es') || languages[1];
    }
    return languages[0];
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      detectedLang,
      setLang: handleSetLang,
      toggleLanguage,
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