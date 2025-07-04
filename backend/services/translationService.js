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

    async translateText(text, targetLanguage) {
        // Create a unique key for caching to avoid re-translating the same text.
        const cacheKey = `${targetLanguage}:${text}