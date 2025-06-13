import { Request, Response } from 'express';
import axios from 'axios';

// A map to associate country codes with language and currency information.
// You can easily add more countries here.
const localeMap: { [key: string]: { lang: string; currency: string; name: string; } } = {
    'BD': { lang: 'bn', currency: 'BDT', name: 'বাংলা' },
    'ES': { lang: 'es', currency: 'EUR', name: 'Español' },
    'DE': { lang: 'de', currency: 'EUR', name: 'Deutsch' },
    'IN': { lang: 'hi', currency: 'INR', name: 'हिन्दी' },
};

export const detectLocale = async (req: Request, res: Response) => {
    try {
        // Render's servers are behind a proxy, so we get the real IP from this header.
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // In a local environment, the IP might be '::1', so we'll use a fallback for testing.
        const testIp = ip === '::1' ? '8.8.8.8' : ip;

        // Call the external IP geolocation API
        const geoResponse = await axios.get(`http://ip-api.com/json/${testIp}`);
        const countryCode = geoResponse.data.countryCode;

        if (countryCode && localeMap[countryCode]) {
            // If the country is in our map, return its locale info.
            res.status(200).json({
                success: true,
                ...localeMap[countryCode]
            });
        } else {
            // Otherwise, default to English/USD.
            res.status(200).json({
                success: true,
                lang: 'en',
                currency: 'USD',
                name: 'English'
            });
        }
    } catch (error) {
        console.error("IP detection failed:", error);
        // If the API fails for any reason, safely default to English/USD.
        res.status(500).json({
            success: true, // Send success so the frontend doesn't show an error
            lang: 'en',
            currency: 'USD',
            name: 'English'
        });
    }
};
