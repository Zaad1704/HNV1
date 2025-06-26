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
      return { code: 'BDT', name: '৳' };
    }
    // Default currency
    return { code: 'USD', name: '$' };
  }, [lang]);


  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("preferredLang", lang);
    document.documentElement.lang = lang;
  }, [lang, i18n]);

  const toggleLanguages = useMemo(() => {
    return Object.values(ALL_SUPPORTED_LANGUAGES_MAP);
  }, []);

  const getNextToggleLanguage = () => {
    const currentIndex = toggleLanguages.findIndex((l) => l.code === lang);
    return toggleLanguages[(currentIndex + 1) % toggleLanguages.length];
  };

  const currentLanguageName = ALL_SUPPORTED_LANGUAGES_MAP[lang]?.name || "English";

  return (
    <LangContext.Provider
      value={{
        lang,
        setLang: setLangState,
        toggleLanguages,
        currentLanguageName,
        getNextToggleLanguage,
        currencyCode: currencyInfo.code,
        currencyName: currencyInfo.name,
      }}
    >
      {children}
    </LangContext.Provider>
  );
};
