import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // Loads translations from your /public/locales folder
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    // Remove the large 'resources' object
    supportedLngs: ['en', 'bn'], // Add all supported languages here
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development', // Enable debug output in development

    // Options for language detector
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },

    // Options for http backend
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
