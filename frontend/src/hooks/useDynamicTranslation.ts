// frontend/src/hooks/useDynamicTranslation.ts
import { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import { useTranslation } from 'react-i18next';

// Simple in-memory cache to avoid re-translating the same text
const translationCache = new Map<string, string>();

export const useDynamicTranslation = (textToTranslate: string) => {
  const { i18n } = useTranslation();
  const targetLanguage = i18n.language;

  // Use state for the translated text, initialized with the input text
  const [translatedText, setTranslatedText] = useState(textToTranslate);
  const [isLoading, setIsLoading] = useState(false);

  // Refs to track the last values that successfully triggered or completed a translation/update
  const lastProcessedTextRef = useRef(textToTranslate);
  const lastProcessedLanguageRef = useRef(targetLanguage);

  useEffect(() => {
    // Phase 1: Determine if any action is needed (translation, cache update, or reset)

    // A. No translation needed or input is invalid
    if (targetLanguage === 'en' || !textToTranslate) {
      // If the current translatedText isn't already the original, update it.
      if (translatedText !== textToTranslate) {
        setTranslatedText(textToTranslate);
      }
      setIsLoading(false); // Ensure loading is off
      // Update refs to reflect that this text/lang combo has been 'processed' to its original state
      lastProcessedTextRef.current = textToTranslate;
      lastProcessedLanguageRef.current = targetLanguage;
      return; // No further action for this effect cycle
    }

    // B. Check cache first
    const cacheKey = `${targetLanguage}:${textToTranslate}`;
    if (translationCache.has(cacheKey)) {
      const cachedValue = translationCache.get(cacheKey)!;
      // Only update state if the current translatedText is different from the cached value
      if (translatedText !== cachedValue) {
        setTranslatedText(cachedValue);
      }
      setIsLoading(false); // Not loading if from cache
      // Update refs to mark this text/lang combo as processed via cache
      lastProcessedTextRef.current = textToTranslate;
      lastProcessedLanguageRef.current = targetLanguage;
      return; // No further action for this effect cycle
    }

    // C. Decide if a new API call is needed (only if content or language has meaningfully changed)
    // Only proceed to fetch if we are NOT currently loading,
    // AND the text or language has changed from the last time we initiated a fetch.
    if (
      isLoading || // Already loading a translation
      (textToTranslate === lastProcessedTextRef.current && targetLanguage === lastProcessedLanguageRef.current) // Input hasn't changed from last fetch attempt
    ) {
      return; // No new fetch needed right now
    }

    // Phase 2: Initiate API call if conditions met
    setIsLoading(true);
    // Update refs immediately BEFORE initiating the fetch to prevent re-triggering the effect
    // with the same "new" values in very fast re-renders.
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
        setTranslatedText(newText); // Update translatedText state
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(textToTranslate); // Fallback to original
      } finally {
        setIsLoading(false); // Always set loading to false after completion/error
      }
    };

    translate();
  }, [textToTranslate, targetLanguage, translatedText, isLoading]); // Dependencies for the effect

  return { translatedText, isLoading };
};
