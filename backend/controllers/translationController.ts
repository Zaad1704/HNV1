import { Request, Response } from 'express';
import translationService from '../services/translationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Re-import AuthenticatedRequest

export const translateContent = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
        return res.status(400).json({ success: false, message: 'Text and targetLanguage are required.' });
    }

    try {
        const translatedText = await translationService.translateText(text, targetLanguage);
        res.status(200).json({ success: true, translatedText });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to translate content.' });
    }
};
