// backend/controllers/localizationController.ts

import { Request, Response } from 'express';
import axios from 'axios';

// A map to associate country codes with language and currency information.
// Only include mappings for explicitly supported languages.
const localeMap: { [key: string]: { lang: string; currency: string; name: string; } } = {
    'BD': { lang: 'bn', currency: 'BDT', name: 'বাংলা' }, // Bangladesh to Bengali
    'US': { lang: 'en', currency: 'USD', name: 'English' }, // USA to English
    'CA': { lang: 'en', currency: 'CAD', name: 'English' }, // Canada defaults to English now
    'GB': { lang: 'en', currency: 'GBP', name: 'English' }, // UK defaults to English
    'AU': { lang: 'en', currency: 'AUD', name: 'English' }  // Australia defaults to English
    // Remove or re-map other countries to 'en' or 'bn' as desired if you don't have separate translation files.
    // Example of re-mapping existing ones to English:
    // 'ES': { lang: 'en', currency: 'EUR', name: 'English' }, 
    // 'DE': { lang: 'en', currency: 'EUR', name: 'English' },
    // 'IN': { lang: 'en', currency: 'INR', name: 'English' },
};

export const detectLocale = async (req: Request, res: Response) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const testIp = ip === '::1' ? '8.8.8.8' : ip;

        const geoResponse = await axios.get(`http://ip-api.com/json/${testIp}`);
        const countryCode = geoResponse.data.countryCode;

        if (countryCode && localeMap[countryCode]) {
            res.status(200).json({
                success: true,
                ...localeMap[countryCode]
            });
        } else {
            // Default to English if country not in map or API fails
            res.status(200).json({
                success: true,
                lang: 'en',
                currency: 'USD',
                name: 'English'
            });
        }
    } catch (error) {
        console.error("IP detection failed:", error);
        res.status(500).json({
            success: true,
            lang: 'en',
            currency: 'USD',
            name: 'English',
            message: 'IP detection failed, defaulting to English.'
        });
    }
};
