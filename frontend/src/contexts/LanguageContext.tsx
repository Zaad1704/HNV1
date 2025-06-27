import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  currencyName: string;
  currencyCode: string;
  availableLanguages: { code: string; name: string; currency: string; currencyCode: string }[];
  getNextToggleLanguage: () => { code: string; name: string; currency: string; currencyCode: string };
  detectAndSetLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const allLanguages = [
  { code: 'en', name: 'English', currency: '$', currencyCode: 'USD' },
  { code: 'bn', name: 'বাংলা', currency: '৳', currencyCode: 'BDT' },
  { code: 'es', name: 'Español', currency: '$', currencyCode: 'USD' },
  { code: 'fr', name: 'Français', currency: '€', currencyCode: 'EUR' },
];

// IP-based language detection mapping
const countryLanguageMap: { [key: string]: string } = {
  'BD': 'bn', // Bangladesh
  'ES': 'es', // Spain
  'MX': 'es', // Mexico
  'AR': 'es', // Argentina
  'FR': 'fr', // France
  'CA': 'fr', // Canada (French regions)
  'BE': 'fr', // Belgium
  'US': 'en', // United States
  'GB': 'en', // United Kingdom
  'AU': 'en', // Australia
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem('language') || 'en');
  const [detectedCountry, setDetectedCountry] = useState<string>('');
  const [availableLanguages, setAvailableLanguages] = useState(allLanguages);

  // Detect user's location and set available languages
  const detectAndSetLanguage = async () => {
    try {
      const response = await fetch('/api/localization/detect');
      const data = await response.json();
      
      if (data.success && data.countryCode) {
        setDetectedCountry(data.countryCode);
        const localLang = countryLanguageMap[data.countryCode];
        
        if (localLang && localLang !== 'en') {
          // Show only English and local language for the detected country
          const localLanguage = allLanguages.find(l => l.code === localLang);
          const englishLanguage = allLanguages.find(l => l.code === 'en');
          
          if (localLanguage && englishLanguage) {
            setAvailableLanguages([englishLanguage, localLanguage]);
          }
          
          // Auto-set to local language if no preference is stored
          if (!localStorage.getItem('language')) {
            setLang(localLang);
          }
        }
      }
    } catch (error) {
      console.error('Language detection failed:', error);
      // Fallback to all languages if detection fails
      setAvailableLanguages(allLanguages);
    }
  };

  useEffect(() => {
    detectAndSetLanguage();
  }, []);

  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }, [lang, i18n]);

  const currentLang = availableLanguages.find(l => l.code === lang) || availableLanguages[0];

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
  };

  const getNextToggleLanguage = () => {
    const currentIndex = availableLanguages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    return availableLanguages[nextIndex];
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang: handleSetLang,
      currencyName: currentLang.currency,
      currencyCode: currentLang.currencyCode,
      availableLanguages,
      getNextToggleLanguage,
      detectAndSetLanguage
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

export { allLanguages };