"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    isConfigured() {
        return !!this.transporter;
    }
    constructor() {
        this.transporter = null;
        this.fromEmail = 'HNV Property Management <noreply@hnvmp.com>';
        console.log('Email service initializing with SMTP...');
        console.log('EMAIL_FROM:', this.fromEmail);
        try {
            this.transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || 'smtp.resend.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER || 'resend',
                    pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY
                }
            });
            console.log('✅ SMTP email service initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize email service:', error);
        }
    }
    async sendEmail(to, subject, templateName, templateData) {
        console.log(`📧 Attempting to send email to ${to}: ${subject}`);
        if (!this.transporter) {
            console.log(`❌ Email service disabled - would send to ${to}: ${subject}`);
            throw new Error('Email service not configured');
        }
        try {
            let htmlContent = '';
            try {
                const templatePath = path_1.default.join(__dirname, '..', 'templates', `${templateName}.html`);
                htmlContent = fs_1.default.readFileSync(templatePath, 'utf-8');
            }
            catch (templateError) {
                console.warn(`Template ${templateName} not found, using fallback`);
                htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1f2937;">${subject}</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${Object.entries(templateData).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('')}
            </div>
            <p style="color: #6b7280; font-size: 14px;">This message was sent from HNV Property Management.</p>
          </div>
        `;
            }
            for (const key in templateData) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                htmlContent = htmlContent.replace(regex, templateData[key]);
            }
            const result = await this.transporter.sendMail({
                from: this.fromEmail,
                to: to,
                subject,
                html: htmlContent,
            });
            console.log('✅ Email sent successfully:', result.messageId);
            return result;
        }
        catch (error) {
            console.error(`Error sending email to ${to}:`, error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
    async sendContactForm(formData) {
        if (!this.transporter) {
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
            await this.transporter.sendMail({
                from: this.fromEmail,
                to: process.env.CONTACT_EMAIL || 'contact@hnvpm.com',
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
