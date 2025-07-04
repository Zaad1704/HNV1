"use strict";
// backend/controllers/localizationController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLocale = void 0;
const axios_1 = __importDefault(require("axios"));
// A map to associate country codes with language and currency information.
const localeMap = {
    'BD': { lang: 'bn', currency: 'BDT', name: '৳' }, // Bangladesh to Bengali, BDT, and Bengali Taka symbol
    'US': { lang: 'en', currency: 'USD', name: '$' }, // USA to English, USD, and Dollar symbol
    'CA': { lang: 'en', currency: 'CAD', name: 'CAD' }, // Canada defaults to English now
    'GB': { lang: 'en', currency: 'GBP', name: 'GBP' }, // UK defaults to English
    'AU': { lang: 'en', currency: 'AUD', name: 'AUD' } // Australia defaults to English
};
const detectLocale = async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const testIp = ip === '::1' ? '8.8.8.8' : ip;
        const geoResponse = await axios_1.default.get(`http://ip-api.com/json/${testIp}