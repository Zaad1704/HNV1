"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLocale = void 0;
const axios_1 = __importDefault(require("axios"));
const localeMap = {
    'BD': { lang: 'bn', currency: 'BDT', name: '৳' },
    'US': { lang: 'en', currency: 'USD', name: '$' },
    'CA': { lang: 'en', currency: 'CAD', name: 'CAD' },
    'GB': { lang: 'en', currency: 'GBP', name: 'GBP' },
    'AU': { lang: 'en', currency: 'AUD', name: 'AUD' }
};
const detectLocale = async (req, res) => {
    try { }
    finally {
    }
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const testIp = ip === '::1' ? '8.8.8.8' : ip;
    const geoResponse = await axios_1.default.get(`http://ip-api.com/json/${testIp}`);
};
exports.detectLocale = detectLocale;
