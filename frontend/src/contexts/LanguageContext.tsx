import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const getLanguageFromCountry = (countryCode: string): string => {
  const countryLanguageMap: Record<string, string> = {
    'BD': 'bn',
    'IN': 'hi', 
    'CN': 'zh',
    'JP': 'ja',
    'ES': 'es',
    'MX': 'es',
    'AR': 'es',
    'FR': 'fr',
    'DE': 'de',
    'BR': 'pt',
    'SA': 'ar',
    'AE': 'ar',
    'EG': 'ar'
  };
  
  return countryLanguageMap[countryCode] || 'en';
};

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
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState('en');
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const initLanguage = async () => {
      try {
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
          setLang(savedLang);
          i18n.changeLanguage(savedLang);
          return;
        }

        // Skip IP detection to avoid CORS issues - use browser language
        const browserLang = navigator.language.split('-')[0];
        const detected = languages.find(l => l.code === browserLang)?.code || 'en';
        setDetectedLang(detected);
        
        const initialLang = detected === 'en' ? 'en' : detected;
        setLang(initialLang);
        i18n.changeLanguage(initialLang);
        localStorage.setItem('language', initialLang);
      } catch {
        setLang('en');
        setDetectedLang('en');
        i18n.changeLanguage('en');
        localStorage.setItem('language', 'en');
      }
    };
    initLanguage();
  }, [i18n]);
  
  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
  };
  
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? detectedLang : 'en';
    handleSetLang(newLang);
  };
  
  const getNextToggleLanguage = () => {
    return lang === 'en' 
      ? languages.find(l => l.code === detectedLang) || languages[0]
      : languages[0];
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

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