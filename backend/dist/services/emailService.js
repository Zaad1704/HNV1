"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        this.resend = null;
        this.fromEmail = process.env.EMAIL_FROM || 'HNV Property Management <noreply@hnvpm.com>';
        if (process.env.RESEND_API_KEY) {
            this.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        }
        else {
            console.warn("RESEND_API_KEY not configured. Email service will be disabled.");
        }
    }
    async sendEmail(to, subject, templateName, templateData) {
        if (!this.resend) {
            console.log(`Email would be sent to ${to}: ${subject}`);
            return;
        }
        try {
            const templatePath = path_1.default.join(__dirname, '..', 'templates', `${templateName}.html`);
            let htmlContent = fs_1.default.readFileSync(templatePath, 'utf-8');
            for (const key in templateData) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                htmlContent = htmlContent.replace(regex, templateData[key]);
            }
            await this.resend.emails.send({
                from: this.fromEmail,
                to: [to],
                subject,
                html: htmlContent,
            });
        }
        catch (error) {
            console.error(`Error sending email to ${to}:`, error);
            throw new Error('Failed to send email.');
        }
    }
    async sendContactForm(formData) {
        if (!this.resend) {
            console.log(`Contact form would be sent: ${formData.subject}`);
            return;
        }
        try {
            const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">New Contact Form Submission</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
              ${formData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This message was sent from the HNV Property Management contact form.</p>
        </div>
      `;
            await this.resend.emails.send({
                from: this.fromEmail,
                to: [process.env.CONTACT_EMAIL || 'contact@hnvpm.com'],
                subject: `Contact Form: ${formData.subject}`,
                html: htmlContent,
                replyTo: formData.email
            });
        }
        catch (error) {
            console.error('Error sending contact form email:', error);
            throw new Error('Failed to send contact form.');
        }
    }
}
exports.default = new EmailService();
