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
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' }
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