import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import enTranslations from '../public/locales/en/translation.json';
import esTranslations from '../public/locales/es/translation.json';
import frTranslations from '../public/locales/fr/translation.json';
import bnTranslations from '../public/locales/bn/translation.json';
import deTranslations from '../public/locales/de/translation.json';
import hiTranslations from '../public/locales/hi/translation.json';
import arTranslations from '../public/locales/ar/translation.json';
import itTranslations from '../public/locales/it/translation.json';
import ptTranslations from '../public/locales/pt/translation.json';
import ruTranslations from '../public/locales/ru/translation.json';
import jaTranslations from '../public/locales/ja/translation.json';
import zhTranslations from '../public/locales/zh/translation.json';
import koTranslations from '../public/locales/ko/translation.json';
import thTranslations from '../public/locales/th/translation.json';
import viTranslations from '../public/locales/vi/translation.json';
import idTranslations from '../public/locales/id/translation.json';
import msTranslations from '../public/locales/ms/translation.json';
import tlTranslations from '../public/locales/tl/translation.json';

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations },
  bn: { translation: bnTranslations },
  de: { translation: deTranslations },
  hi: { translation: hiTranslations },
  ar: { translation: arTranslations },
  it: { translation: itTranslations },
  pt: { translation: ptTranslations },
  ru: { translation: ruTranslations },
  ja: { translation: jaTranslations },
  zh: { translation: zhTranslations },
  ko: { translation: koTranslations },
  th: { translation: thTranslations },
  vi: { translation: viTranslations },
  id: { translation: idTranslations },
  ms: { translation: msTranslations },
  tl: { translation: tlTranslations }
};

const getInitialLanguage = () => {
  try {
    return localStorage.getItem('selectedLanguage') || 'en';
  } catch {
    return 'en';
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;