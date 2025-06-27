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
  convertPrice: (price: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const allLanguages = [
  { code: 'en', name: 'English', currency: '$', currencyCode: 'USD' },
  { code: 'bn', name: 'বাংলা', currency: '৳', currencyCode: 'BDT' },
  { code: 'es', name: 'Español', currency: '€', currencyCode: 'EUR' },
  { code: 'fr', name: 'Français', currency: '€', currencyCode: 'EUR' },
  { code: 'hi', name: 'हिन्दी', currency: '₹', currencyCode: 'INR' },
  { code: 'ar', name: 'العربية', currency: 'ر.س', currencyCode: 'SAR' },
  { code: 'zh', name: '中文', currency: '¥', currencyCode: 'CNY' },
  { code: 'ja', name: '日本語', currency: '¥', currencyCode: 'JPY' },
  { code: 'ko', name: '한국어', currency: '₩', currencyCode: 'KRW' },
  { code: 'ru', name: 'Русский', currency: '₽', currencyCode: 'RUB' },
  { code: 'de', name: 'Deutsch', currency: '€', currencyCode: 'EUR' },
  { code: 'pt', name: 'Português', currency: 'R$', currencyCode: 'BRL' },
  { code: 'it', name: 'Italiano', currency: '€', currencyCode: 'EUR' },
  { code: 'tr', name: 'Türkçe', currency: '₺', currencyCode: 'TRY' },
  { code: 'ms', name: 'Bahasa Melayu', currency: 'RM', currencyCode: 'MYR' },
  { code: 'th', name: 'ไทย', currency: '฿', currencyCode: 'THB' },
  { code: 'id', name: 'Bahasa Indonesia', currency: 'Rp', currencyCode: 'IDR' },
  { code: 'vi', name: 'Tiếng Việt', currency: '₫', currencyCode: 'VND' },
  { code: 'ta', name: 'தமிழ்', currency: '₹', currencyCode: 'INR' }
];

const exchangeRates: { [key: string]: number } = {
  'USD': 1, 'BDT': 110, 'EUR': 0.85, 'INR': 83, 'SAR': 3.75, 'CNY': 7.2, 'JPY': 150,
  'KRW': 1300, 'RUB': 75, 'BRL': 5.2, 'TRY': 30, 'MYR': 4.5, 'THB': 35, 'IDR': 15000, 'VND': 24000
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem('language') || 'en');
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: 'en', name: 'English', currency: '$', currencyCode: 'USD' }
  ]);

  const detectAndSetLanguage = async () => {
    try {
      const response = await fetch('/api/localization/detect');
      const data = await response.json();
      
      if (data.success && data.lang && data.lang !== 'en') {
        const localLanguage = allLanguages.find(l => l.code === data.lang);
        const englishLanguage = allLanguages.find(l => l.code === 'en');
        
        if (localLanguage && englishLanguage) {
          localLanguage.currency = data.name;
          localLanguage.currencyCode = data.currency;
          setAvailableLanguages([englishLanguage, localLanguage]);
          
          if (!localStorage.getItem('language')) {
            setLang(data.lang);
          }
        }
      }
    } catch (error) {
      console.error('Language detection failed:', error);
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

  const convertPrice = (priceInCents: number): string => {
    const priceInUSD = priceInCents / 100;
    const rate = exchangeRates[currentLang.currencyCode] || 1;
    const convertedPrice = priceInUSD * rate;
    
    if (['IDR', 'VND', 'KRW'].includes(currentLang.currencyCode)) {
      return `${currentLang.currency}${Math.round(convertedPrice).toLocaleString()}`;
    }
    
    return `${currentLang.currency}${convertedPrice.toFixed(2)}`;
  };

  const getNextToggleLanguage = () => {
    const currentIndex = availableLanguages.findIndex(l => l.code === lang);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    return availableLanguages[nextIndex];
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      currencyName: currentLang.currency,
      currencyCode: currentLang.currencyCode,
      availableLanguages,
      getNextToggleLanguage,
      detectAndSetLanguage,
      convertPrice
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