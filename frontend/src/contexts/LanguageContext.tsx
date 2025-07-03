import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, getLanguageByCountry, getLanguageByCode, LanguageConfig } from '../utils/languageConfig';
import { detectUserLocation } from '../services/ipService';

interface LanguageContextType {
  currentLanguage: LanguageConfig;
  availableLanguages: LanguageConfig[];
  changeLanguage: (languageCode: string) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(languages[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Check if user has previously selected a language
        const savedLanguage = localStorage.getItem('selectedLanguage');
        
        if (savedLanguage) {
          const language = getLanguageByCode(savedLanguage);
          setCurrentLanguage(language);
          await i18n.changeLanguage(language.code);
        } else {
          // Detect user location and set language accordingly
          const location = await detectUserLocation();
          
          if (location?.countryCode) {
            const detectedLanguage = getLanguageByCountry(location.countryCode);
            setCurrentLanguage(detectedLanguage);
            await i18n.changeLanguage(detectedLanguage.code);
            localStorage.setItem('selectedLanguage', detectedLanguage.code);
            localStorage.setItem('selectedCurrency', detectedLanguage.currency);
          }
        }
      } catch (error) {
        console.error('Language initialization failed:', error);
        // Fallback to English
        setCurrentLanguage(languages[0]);
        await i18n.changeLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      const language = getLanguageByCode(languageCode);
      setCurrentLanguage(language);
      await i18n.changeLanguage(language.code);
      
      // Save preferences
      localStorage.setItem('selectedLanguage', language.code);
      localStorage.setItem('selectedCurrency', language.currency);
      
      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language, currency: language.currency } 
      }));
    } catch (error) {
      console.error('Language change failed:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      availableLanguages: languages,
      changeLanguage,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};