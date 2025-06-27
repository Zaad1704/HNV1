// backend/controllers/localizationController.ts

import { Request, Response } from 'express';
import axios from 'axios';

// A map to associate country codes with language and currency information.
const localeMap: { [key: string]: { lang: string; currency: string; name: string; countryCode: string } } = {
    'BD': { lang: 'bn', currency: 'BDT', name: '৳', countryCode: 'BD' }, // Bangladesh
    'US': { lang: 'en', currency: 'USD', name: '$', countryCode: 'US' }, // USA
    'CA': { lang: 'en', currency: 'CAD', name: 'CAD', countryCode: 'CA' }, // Canada
    'GB': { lang: 'en', currency: 'GBP', name: 'GBP', countryCode: 'GB' }, // UK
    'AU': { lang: 'en', currency: 'AUD', name: 'AUD', countryCode: 'AU' }, // Australia
    'ES': { lang: 'es', currency: 'EUR', name: '€', countryCode: 'ES' }, // Spain
    'MX': { lang: 'es', currency: 'MXN', name: '$', countryCode: 'MX' }, // Mexico
    'AR': { lang: 'es', currency: 'ARS', name: '$', countryCode: 'AR' }, // Argentina
    'FR': { lang: 'fr', currency: 'EUR', name: '€', countryCode: 'FR' }, // France
    'BE': { lang: 'fr', currency: 'EUR', name: '€', countryCode: 'BE' }, // Belgium
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
                countryCode: countryCode,
                ...localeMap[countryCode]
            });
        } else {
            res.status(200).json({
                success: true,
                countryCode: 'US',
                lang: 'en',
                currency: 'USD',
                name: '$', // Default to English/USD
            });
        }
    } catch (error) {
        console.error("IP detection failed:", error);
        res.status(500).json({
            success: false,
            countryCode: 'US',
            lang: 'en',
            currency: 'USD',
            name: '$',
            message: 'IP detection failed, defaulting to English.'
        });
    }
};