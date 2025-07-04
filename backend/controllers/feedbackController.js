"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFeedbackSubmission = void 0;
const emailService_1 = __importDefault(require("../services/emailService"));
const handleFeedbackSubmission = async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
        return;

    const recipientEmail = 'feedback@hnvpropertysolutions.com';
    const emailSubject = `New Feedback from ${name}: ${subject || 'No Subject'}