"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateContent = void 0;
const translationService_1 = __importDefault(require("../services/translationService"));
const translateContent = async (req, res) => {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
        res.status(400).json({ success: false, message: 'Text and targetLanguage are required.' });
        return;

    try {
        const translatedText = await translationService_1.default.translateText(text, targetLanguage);
        res.status(200).json({ success: true, translatedText });

    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to translate content.' });

};
exports.translateContent = translateContent;
//# sourceMappingURL=translationController.js.map