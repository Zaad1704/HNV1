import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // FIX: Throw an error if config is missing to ensure transporter is always assigned.
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("FATAL ERROR: Email service credentials are not configured in .env file.");
      throw new Error("Email service is not configured.");
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: (process.env.EMAIL_PORT === '465'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, templateName: string, templateData: Record<string, string>) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
      let htmlContent = fs.readFileSync(templatePath, 'utf-8');

      for (const key in templateData) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, templateData[key]);
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || '"HNV" <no-reply@hnv.com>',
        to,
        subject,
        html: htmlContent,
      };
      
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw new Error('Failed to send email.');
    }
  }
}

export default new EmailService();
