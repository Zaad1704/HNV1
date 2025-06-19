import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useTranslation } from 'react-i18next';

// Simple in-memory cache to avoid re-translating the same text
const translationCache = new Map<string, string>();

export const useDynamicTranslation = (textToTranslate: string) => {
  const { i18n } = useTranslation();
  const targetLanguage = i18n.language;

  const [translatedText, setTranslatedText] = useState(textToTranslate);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't translate if the target language is English or if there's no text
    if (targetLanguage === 'en' || !textToTranslate) {
      setTranslatedText(textToTranslate);
      return;
    }

    const cacheKey = `${targetLanguage}:${textToTranslate}`;
    if (translationCache.has(cacheKey)) {
      setTranslatedText(translationCache.get(cacheKey)!);
      return;
    }

    const translate = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.post('/translate', {
          text: textToTranslate,
          targetLanguage: targetLanguage,
        });
        const newText = response.data.translatedText;
        translationCache.set(cacheKey, newText);
        setTranslatedText(newText);
      } catch (error) {
        console.error('Translation failed:', error);
        // If translation fails, fall back to the original text
        setTranslatedText(textToTranslate);
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [textToTranslate, targetLanguage]);

  return { translatedText, isLoading };
};
