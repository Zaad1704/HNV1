import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations directly
import enTranslations from './locales/en/translation.json';
import zhTranslations from './locales/zh/translation.json';
import jaTranslations from './locales/ja/translation.json';
import koTranslations from './locales/ko/translation.json';
import hiTranslations from './locales/hi/translation.json';
import thTranslations from './locales/th/translation.json';
import arTranslations from './locales/ar/translation.json';
import deTranslations from './locales/de/translation.json';
import frTranslations from './locales/fr/translation.json';
import esTranslations from './locales/es/translation.json';
import itTranslations from './locales/it/translation.json';
import ptTranslations from './locales/pt/translation.json';
import ruTranslations from './locales/ru/translation.json';
import nlTranslations from './locales/nl/translation.json';
import svTranslations from './locales/sv/translation.json';
import trTranslations from './locales/tr/translation.json';
import bnTranslations from './locales/bn/translation.json';
import tlTranslations from './locales/tl/translation.json';

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

console.log('Translation resources loaded:', {
  totalLanguages: Object.keys(resources).length,
  languages: Object.keys(resources),
  enKeysCount: Object.keys(enTranslations).length
});

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
    },
    initImmediate: false,
    load: 'languageOnly'
  })
  .then(() => {
    console.log('i18n initialized successfully');
    console.log('Available languages:', Object.keys(resources));
    console.log('Current language:', i18n.language);
    console.log('Resources loaded:', i18n.hasResourceBundle('en', 'translation'));
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;