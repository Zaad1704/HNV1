// backend/controllers/feedbackController.ts

import { Request, Response } from 'express';
import emailService from '../services/emailService';

export const handleFeedbackSubmission = async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
    }

    // --- Customize Your Email Here ---
    const recipientEmail = 'your-feedback-email@yourdomain.com'; // IMPORTANT: Change this to your actual email address
    const emailSubject = `New Feedback from ${name}: ${subject || 'No Subject'}`;
    const emailHtml = `
        <h1>New Website Feedback</h1>
        <p>You have received a new message from the HNV website contact form.</p>
        <hr>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject || 'Not Provided'}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message}</p>
    `;

    try {
        await emailService.sendEmail(recipientEmail, emailSubject, emailHtml);
        res.status(200).json({ success: true, message: 'Feedback sent successfully!' });
    } catch (error) {
        console.error('Failed to send feedback email:', error);
        res.status(500).json({ success: false, message: 'Server error: could not send feedback.' });
    }
};
