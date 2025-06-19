// backend/controllers/communicationController.ts
import { Request, Response } from 'express';
import emailService from '../services/emailService';
import Tenant from '../models/Tenant';

export const sendCustomEmail = async (req: Request, res: Response) => {
    const { recipientEmail, subject, message } = req.body;
    const sender = req.user;

    if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Recipient, subject, and message are required.' });
    }

    if (!sender) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const tenant = await Tenant.findOne({ email: recipientEmail, organizationId: sender.organizationId });
        if (!tenant) {
            return res.status(403).json({ success: false, message: "You do not have permission to contact this recipient." });
        }

        await emailService.sendEmail(
            recipientEmail,
            subject,
            'customMessage', 
            {
                // Corrected: provide fallback for optional name
                senderName: sender.name || "The Management",
                messageBody: message.replace(/\n/g, '<br>')
            }
        );

        res.status(200).json({ success: true, message: 'Email sent successfully.' });

    } catch (error) {
        console.error('Failed to send custom email:', error);
        res.status(500).json({ success: false, message: 'Server error: Could not send email.' });
    }
};
