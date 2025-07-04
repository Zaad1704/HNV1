import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import enTranslations from '../public/locales/en/translation.json';
import zhTranslations from '../public/locales/zh/translation.json';
import jaTranslations from '../public/locales/ja/translation.json';
import koTranslations from '../public/locales/ko/translation.json';
import hiTranslations from '../public/locales/hi/translation.json';
import thTranslations from '../public/locales/th/translation.json';
import arTranslations from '../public/locales/ar/translation.json';
import deTranslations from '../public/locales/de/translation.json';
import frTranslations from '../public/locales/fr/translation.json';
import esTranslations from '../public/locales/es/translation.json';
import itTranslations from '../public/locales/it/translation.json';
import ptTranslations from '../public/locales/pt/translation.json';
import ruTranslations from '../public/locales/ru/translation.json';
import nlTranslations from '../public/locales/nl/translation.json';
import svTranslations from '../public/locales/sv/translation.json';
import trTranslations from '../public/locales/tr/translation.json';
import bnTranslations from '../public/locales/bn/translation.json';
import tlTranslations from '../public/locales/tl/translation.json';

const resources = {
  en: { translation: enTranslations },
  zh: { translation: zhTranslations },
  ja: { translation: jaTranslations },
  ko: { translation: koTranslations },
  hi: { translation: hiTranslations },
  th: { translation: thTranslations },
  ar: { translation: arTranslations },
  de: { translation: deTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations },
  it: { translation: itTranslations },
  pt: { translation: ptTranslations },
  ru: { translation: ruTranslations },
  nl: { translation: nlTranslations },
  sv: { translation: svTranslations },
  tr: { translation: trTranslations },
  bn: { translation: bnTranslations },
  tl: { translation: tlTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;