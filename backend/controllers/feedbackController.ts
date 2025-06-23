import { Request, Response } from 'express';
import emailService from '../services/emailService';

export const handleFeedbackSubmission = async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        res.status(400).json({ success: false, message: 'Name, email, and message are required fields.' });
        return;
    }

    const recipientEmail = 'feedback@hnvpropertysolutions.com'; 
    const emailSubject = `New Feedback from ${name}: ${subject || 'No Subject'}`;

    try {
        await emailService.sendEmail(
            recipientEmail, 
            emailSubject, 
            'feedbackReceived',
            {
                name: name,
                email: email,
                subject: subject || 'Not Provided',
                message: message.replace(/\n/g, '<br>')
            }
        );
        res.status(200).json({ success: true, message: 'Feedback sent successfully!' });
    } catch (error) {
        console.error('Failed to send feedback email:', error);
        res.status(500).json({ success: false, message: 'Server error: could not send feedback.' });
    }
};
