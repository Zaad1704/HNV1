"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const libreTranslateUrl = 'https://libretranslate.de/translate';
class TranslationService {
    constructor() {
        this.cache = new Map();
    }
    async translateText(text, targetLanguage) {
        // Create a unique key for caching to avoid re-translating the same text.
        const cacheKey = `${targetLanguage}:${text}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            // If text is empty or not a string, return it as is.
            if (!text || typeof text !== 'string' || targetLanguage === 'en') {
                return text;
            }
            const response = await axios_1.default.post(libreTranslateUrl, {
                q: text,
                source: 'en', // Assuming the source of most dynamic data is English
                target: targetLanguage,
                format: 'text'
            });
            const translatedText = response.data.translatedText;
            this.cache.set(cacheKey, translatedText);
            return translatedText;
        }
        catch (error) {
            console.error('ERROR using LibreTranslate API:', error);
            // If translation fails, return the original text so the UI doesn't break.
            return text;
        }
    }
}
exports.default = new TranslationService();
//# sourceMappingURL=translationService.js.map