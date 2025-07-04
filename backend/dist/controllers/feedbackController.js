"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleFeedbackSubmission = void 0;
const handleFeedbackSubmission = async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
        return;
        const recipientEmail = 'feedback@hnvpropertysolutions.com';
        const emailSubject = `New Feedback from ${name}: ${subject || 'No Subject'}`;
    }
};
exports.handleFeedbackSubmission = handleFeedbackSubmission;
