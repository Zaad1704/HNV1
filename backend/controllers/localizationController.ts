import { Request, Response } from 'express';
import axios from 'axios';

const localeMap: { [key: string]: { lang: string; currency: string; name: string } } = {
    'BD': { lang: 'bn', currency: 'BDT', name: '৳' },
    'US': { lang: 'en', currency: 'USD', name: '$' },
    'CA': { lang: 'en', currency: 'CAD', name: 'C$' },
    'GB': { lang: 'en', currency: 'GBP', name: '£' },
    'AU': { lang: 'en', currency: 'AUD', name: 'A$' },
    'ES': { lang: 'es', currency: 'EUR', name: '€' },
    'MX': { lang: 'es', currency: 'MXN', name: '$' },
    'AR': { lang: 'es', currency: 'ARS', name: '$' },
    'FR': { lang: 'fr', currency: 'EUR', name: '€' },
    'BE': { lang: 'fr', currency: 'EUR', name: '€' },
    'IN': { lang: 'hi', currency: 'INR', name: '₹' },
    'MY': { lang: 'ms', currency: 'MYR', name: 'RM' },
    'TH': { lang: 'th', currency: 'THB', name: '฿' },
    'ID': { lang: 'id', currency: 'IDR', name: 'Rp' },
    'CN': { lang: 'zh', currency: 'CNY', name: '¥' },
    'TW': { lang: 'zh', currency: 'TWD', name: 'NT$' },
    'HK': { lang: 'zh', currency: 'HKD', name: 'HK$' },
    'SG': { lang: 'en', currency: 'SGD', name: 'S$' },
    'PH': { lang: 'en', currency: 'PHP', name: '₱' },
    'VN': { lang: 'vi', currency: 'VND', name: '₫' },
    'KR': { lang: 'ko', currency: 'KRW', name: '₩' },
    'JP': { lang: 'ja', currency: 'JPY', name: '¥' },
    'SA': { lang: 'ar', currency: 'SAR', name: 'ر.س' },
    'AE': { lang: 'ar', currency: 'AED', name: 'د.إ' },
    'RU': { lang: 'ru', currency: 'RUB', name: '₽' },
    'DE': { lang: 'de', currency: 'EUR', name: '€' },
    'BR': { lang: 'pt', currency: 'BRL', name: 'R$' },
    'IT': { lang: 'it', currency: 'EUR', name: '€' },
    'TR': { lang: 'tr', currency: 'TRY', name: '₺' }
};

export const detectLocale = async (req: Request, res: Response) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const testIp = ip === '::1' ? '8.8.8.8' : ip;

        const geoResponse = await axios.get(`http://ip-api.com/json/${testIp}`);
        const data = geoResponse.data;

        if (data && data.status === 'success' && data.countryCode) {
            const countryCode = data.countryCode;
            const locale = localeMap[countryCode];
            
            if (locale) {
                res.json({
                    success: true,
                    countryCode,
                    lang: locale.lang,
                    currency: locale.currency,
                    name: locale.name
                });
            } else {
                res.json({
                    success: true,
                    countryCode: 'US',
                    lang: 'en',
                    currency: 'USD',
                    name: '$'
                });
            }
        } else {
            res.json({
                success: true,
                countryCode: 'US',
                lang: 'en',
                currency: 'USD',
                name: '$'
            });
        }
    } catch (error) {
        console.error("IP detection failed:", error);
        res.json({
            success: true,
            countryCode: 'US',
            lang: 'en',
            currency: 'USD',
            name: '$'
        });
    }
};