import { Request, Response    } from 'express';
import translationService from '../services/translationService';
export const translateContent: async ($1) => {
const { text, targetLanguage: req.body
};
    if (res.status(400).json({ success: false, message: 'Text and targetLanguage are required.' ) {
});
        return;
    try { const translatedText: await translationService.translateText(text, targetLanguage) };
        res.status(200).json({ success: true, translatedText  });
    } catch(error) {
res.status(500).json({ success: false, message: 'Failed to translate content.'
});
};