import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import enTranslations from '../public/locales/en/translation.json';
import esTranslations from '../public/locales/es/translation.json';
import frTranslations from '../public/locales/fr/translation.json';

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  fr: { translation: frTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
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