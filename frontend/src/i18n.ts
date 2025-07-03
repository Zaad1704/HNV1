import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

const supportedLanguages = [
  'en', 'zh', 'ja', 'ko', 'hi', 'th', 'vi', 'id', 'ms', 'tl', 'ur', 'bn',
  'de', 'fr', 'es', 'it', 'pt', 'ru', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'tr', 'el',
  'ar', 'sw', 'am', 'ha', 'yo', 'zu', 'af',
  'pt-BR', 'es-MX', 'es-AR', 'fr-CA',
  'en-AU', 'en-NZ'
];

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    supportedLngs: supportedLanguages,
    fallbackLng: 'en',
    debug: true,
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