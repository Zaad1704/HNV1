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
        const cacheKey = `${targetLanguage}:${text}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        try {
            if (!text || typeof text !== 'string' || targetLanguage === 'en') {
                return text;
            }
            const response = await axios_1.default.post(libreTranslateUrl, {
                q: text,
                source: 'en',
                target: targetLanguage,
                format: 'text'
            });
            const translatedText = response.data.translatedText;
            this.cache.set(cacheKey, translatedText);
            return translatedText;
        }
        catch (error) {
            console.error('ERROR using LibreTranslate API:', error);
            return text;
        }
    }
}
exports.default = new TranslationService();
