import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const getLanguageFromCountry = (countryCode: string): string => {
  const countryLanguageMap: Record<string, string> = {
    'BD': 'bn', 'IN': 'hi', 'PK': 'hi',
    'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'SG': 'zh',
    'JP': 'ja',
    'KR': 'ko',
    'TH': 'th',
    'VN': 'vi',
    'ID': 'id',
    'MY': 'ms', 'BN': 'ms',
    'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'PE': 'es', 'VE': 'es', 'CL': 'es',
    'FR': 'fr', 'CA': 'fr', 'BE': 'fr', 'CH': 'fr',
    'DE': 'de', 'AT': 'de',
    'IT': 'it',
    'BR': 'pt', 'PT': 'pt',
    'RU': 'ru', 'BY': 'ru', 'KZ': 'ru',
    'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'JO': 'ar', 'LB': 'ar', 'SY': 'ar', 'IQ': 'ar',
    'TR': 'tr',
    'NL': 'nl',
    'SE': 'sv', 'NO': 'sv', 'DK': 'sv'
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
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' }
];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [detectedLang, setDetectedLang] = useState('en');
  const { i18n } = useTranslation();
  
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Always detect regional language first
        const detected = await detectRegionalLanguage();
        
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
          setLang(savedLang);
          i18n.changeLanguage(savedLang);
          return;
        }

        // Use detected language as initial if not English
        const initialLang = detected !== 'en' ? detected : 'en';
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

  const detectRegionalLanguage = async (): Promise<string> => {
    // Always set a fallback first
    const browserLang = navigator.language.split('-')[0];
    const browserDetected = languages.find(l => l.code === browserLang)?.code || 'es';
    setDetectedLang(browserDetected);
    
    try {
      // Try IP-based detection
      const response = await fetch('https://ipapi.co/json/', { timeout: 3000 });
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code;
        const detected = getLanguageFromCountry(countryCode);
        if (detected !== 'en') {
          setDetectedLang(detected);
          return detected;
        }
      }
    } catch (error) {
      console.log('IP detection failed, using browser language');
    }
    
    return browserDetected;
  };
  
  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
    i18n.changeLanguage(newLang);
  };
  
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? (detectedLang !== 'en' ? detectedLang : 'es') : 'en';
    handleSetLang(newLang);
  };
  
  const getNextToggleLanguage = () => {
    if (lang === 'en') {
      return languages.find(l => l.code === detectedLang) || languages.find(l => l.code === 'es') || languages[1];
    }
    return languages[0];
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