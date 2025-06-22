// frontend/src/hooks/useDynamicTranslation.ts
import { useState, useEffect, useRef } from 'react'; // Import useRef
import apiClient from '../api/client';
import { useTranslation } from 'react-i18next';

// Simple in-memory cache to avoid re-translating the same text
const translationCache = new Map<string, string>();

export const useDynamicTranslation = (textToTranslate: string) => {
  const { i18n } = useTranslation();
  const targetLanguage = i18n.language;

  const [translatedText, setTranslatedText] = useState(textToTranslate);
  const [isLoading, setIsLoading] = useState(false);

  // Use a ref to track the last text value that was successfully translated or set,
  // to avoid redundant state updates in cases where props might re-render.
  const lastProcessedTextRef = useRef(textToTranslate);
  const lastProcessedLanguageRef = useRef(targetLanguage);

  useEffect(() => {
    // If the text hasn't changed, or the target language hasn't changed since last processing,
    // or if translation is not needed (English or empty text),
    // and we're not currently loading, and the current translatedText already matches the input,
    // then bail out to prevent unnecessary work and potential loops.
    if (
      !textToTranslate || // No text to translate
      targetLanguage === 'en' || // English doesn't need translation
      (textToTranslate === lastProcessedTextRef.current && targetLanguage === lastProcessedLanguageRef.current) // Input hasn't changed meaningfully
    ) {
      // Ensure the displayed text is the original if no translation is needed
      if (translatedText !== textToTranslate) {
          setTranslatedText(textToTranslate);
      }
      setIsLoading(false); // Ensure loading is false if nothing is being done
      return;
    }

    const cacheKey = `${targetLanguage}:${textToTranslate}`;
    if (translationCache.has(cacheKey)) {
      const cached = translationCache.get(cacheKey)!;
      if (translatedText !== cached) { // Only update if the state needs to change
        setTranslatedText(cached);
      }
      setIsLoading(false); // Not loading if from cache
      lastProcessedTextRef.current = textToTranslate;
      lastProcessedLanguageRef.current = targetLanguage;
      return;
    }

    // If we reach here, we need to perform a translation.
    // Set loading state and update refs for the current attempt.
    setIsLoading(true);
    lastProcessedTextRef.current = textToTranslate;
    lastProcessedLanguageRef.current = targetLanguage;

    const translate = async () => {
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
        setTranslatedText(textToTranslate); // Fallback to original text on error
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [textToTranslate, targetLanguage, translatedText, isLoading]); // Include all state and props used inside the effect as dependencies

  return { translatedText, isLoading };
};
