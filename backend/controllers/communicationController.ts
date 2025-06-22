// backend/controllers/communicationController.ts

import { Request, Response } from 'express';
import emailService from '../services/emailService';
import Tenant from '../models/Tenant';
import User from '../models/User';
import Property from '../models/Property';

export const sendCustomEmail = async (req: Request, res: Response) => {
    const { recipientEmail, subject, message } = req.body;
    const sender = req.user;

    if (!recipientEmail || !subject || !message) {
        return res.status(400).json({ success: false, message: 'Recipient, subject, and message are required.' });
    }

    if (!sender || !sender.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
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

export const sendRentReminder = async (req: Request, res: Response) => {
    const { tenantId } = req.body;
    const sender = req.user;

    if (!tenantId) {
        res.status(400);
        throw new Error('Tenant ID is required.');
    }
    if (!sender || !sender.organizationId) {
        res.status(401);
        throw new Error('Not authorized or not part of an organization.');
    }

    try {
        const tenant = await Tenant.findById(tenantId).populate('propertyId', 'name'); 

        if (!tenant || tenant.organizationId.toString() !== sender.organizationId.toString()) {
            res.status(404);
            throw new Error('Tenant not found in your organization.');
        }

        const senderName = sender.name || (sender.role === 'Landlord' ? 'Your Landlord' : 'Your Agent');
        const senderEmail = sender.email;

        const propertyName = (tenant.propertyId as any)?.name || 'your property';

        const subject = `Rent Payment Reminder for Unit ${tenant.unit} - ${propertyName}`;
        const messageBody = `
            <p>Dear ${tenant.name},</p>
            <p>This is a friendly reminder that your rent payment for Unit ${tenant.unit} at ${propertyName} is currently overdue.</p>
            <p>The amount due is **$${tenant.rentAmount?.toFixed(2) || '0.00'}**.</p>
            <p>Please make your payment as soon as possible to avoid any further late fees.</p>
            <p>If you have already made this payment, please disregard this reminder.</p>
            <p>Thank you for your prompt attention to this matter.</p>
            <p>Best regards,<br>${senderName}<br>Email: ${senderEmail}</p>
        `;

        await emailService.sendEmail(
            tenant.email,
            subject,
            'customMessage',
            {
                senderName: senderName,
                messageBody: messageBody.replace(/\n/g, '<br>')
            }
        );

        res.status(200).json({ success: true, message: `Rent reminder sent to ${tenant.email}` });

    } catch (error) {
        console.error('Error sending rent reminder:', error);
        res.status(500).json({ success: false, message: 'Server Error: Could not send reminder email.' });
    }
};
