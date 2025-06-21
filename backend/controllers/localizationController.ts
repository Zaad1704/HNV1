// backend/controllers/localizationController.ts
import { Request, Response } from 'express';
import axios from 'axios';

// A map to associate country codes with language and currency information.
// You can easily add more countries here.
const localeMap: { [key: string]: { lang: string; currency: string; name: string; } } = {
    'BD': { lang: 'bn', currency: 'BDT', name: 'বাংলা' },
    'ES': { lang: 'es', currency: 'EUR', name: 'Español' },
    'DE': { lang: 'de', currency: 'EUR', name: 'Deutsch' },
    'IN': { lang: 'hi', currency: 'INR', name: 'हिन्दी' },
    'CA': { lang: 'fr', currency: 'CAD', name: 'Français' }, // Added for Canada -> French
    'US': { lang: 'en', currency: 'USD', name: 'English' } // Explicitly define for US to ensure 'en' is specific
};

export const detectLocale = async (req: Request, res: Response) => {
    try {
        // Render's servers are behind a proxy, so we get the real IP from this header.
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // In a local environment, the IP might be '::1', so we'll use a fallback for testing.
        // For testing specific countries, you can temporarily change '8.8.8.8' to an IP from that country.
        // E.g., for Canada: '24.48.0.1' (Montreal, Canada); for Bangladesh: '103.111.206.0' (Dhaka, Bangladesh)
        const testIp = ip === '::1' ? '8.8.8.8' : ip; // Defaulting to generic for local testing

        // Call the external IP geolocation API
        const geoResponse = await axios.get(`http://ip-api.com/json/${testIp}`);
        const countryCode = geoResponse.data.countryCode;

        // Use the map for specific countries, otherwise default to English
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
            name: 'English',
            message: 'IP detection failed, defaulting to English.'
        });
    }
};
