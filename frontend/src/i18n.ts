import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'ar', 'bn', 'de', 'es', 'fr', 'hi', 'ja', 'pt', 'zh', 'ko', 'it', 'ru', 'tr', 'nl', 'sv', 'th', 'vi', 'id', 'ms'],
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      requestOptions: {
        cache: 'default'
      }
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    load: 'languageOnly',
    cleanCode: true,
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false
  });

export default i18n;