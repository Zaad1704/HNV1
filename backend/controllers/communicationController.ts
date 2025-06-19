import { Request, Response } from 'express'; // FIX: Import Request
// FIX: AuthenticatedRequest is no longer needed due to global type augmentation.
import emailService from '../services/emailService';
import Tenant from '../models/Tenant';

export const sendCustomEmail = async (req: Request, res: Response) => { // FIX: Use Request
    const { recipientEmail, subject, message } = req.body;
    const sender = req.user;

    if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Recipient, subject, and message are required.' });
    }

    if (!sender) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        // Security Check: Ensure the sender's organization owns the tenant with this email.
        const tenant = await Tenant.findOne({ email: recipientEmail, organizationId: sender.organizationId });
        if (!tenant) {
            return res.status(403).json({ success: false, message: "You do not have permission to contact this recipient." });
        }

        // Assumes a template named 'customMessage.html' exists in backend/src/templates/
        await emailService.sendEmail(
            recipientEmail,
            subject,
            'customMessage', 
            {
                senderName: sender.name,
                messageBody: message.replace(/\n/g, '<br>')
            }
        );

        res.status(200).json({ success: true, message: 'Email sent successfully.' });

    } catch (error) {
        console.error('Failed to send custom email:', error);
        res.status(500).json({ success: false, message: 'Server error: Could not send email.' });
    }
};
