import axios from 'axios';

const libreTranslateUrl = 'https://libretranslate.de/translate';

class TranslationService {
  private cache = new Map<string, string>();

  async translateText(text: string, targetLanguage: string): Promise<string> {
    // Create a unique key for caching to avoid re-translating the same text.
    const cacheKey = `${targetLanguage}:${text}