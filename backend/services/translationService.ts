import axios from 'axios';

const libreTranslateUrl = 'https://libretranslate.de/translate';

class TranslationService {
  private cache = new Map<string, string>();

  async translateText(text: string, targetLanguage: string): Promise<string> {
    // Create a unique key for caching to avoid re-translating the same text.
    const cacheKey = `${targetLanguage}:${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // If text is empty or not a string, return it as is.
      if (!text || typeof text !== 'string' || targetLanguage === 'en') {
        return text;
      }

      const response = await axios.post(libreTranslateUrl, {
          q: text,
          source: 'en', // Assuming the source of most dynamic data is English
          target: targetLanguage,
          format: 'text'
      });
      
      const translatedText = response.data.translatedText;
      this.cache.set(cacheKey, translatedText);
      return translatedText;

    } catch (error) {
      console.error('ERROR using LibreTranslate API:', error);
      // If translation fails, return the original text so the UI doesn't break.
      return text;
    }
  }
}

export default new TranslationService();
