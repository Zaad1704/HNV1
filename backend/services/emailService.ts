import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Ensure required environment variables are set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("FATAL ERROR: Email service credentials are not configured in .env file.");
      // In a real app, you might want the process to exit if email is critical.
      // process.exit(1);
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: (process.env.EMAIL_PORT === '465'), // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Updated sendEmail method to use HTML templates
  async sendEmail(to: string, subject: string, templateName: string, templateData: Record<string, string>) {
    if (!this.transporter) {
        console.error("Email transporter not initialized. Check your .env configuration.");
        return;
    }

    try {
      const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
      let htmlContent = fs.readFileSync(templatePath, 'utf-8');

      // Replace placeholders like {{userName}} with actual data
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

      console.log(`Sending email to <span class="math-inline">\{to\} with subject "</span>{subject}"`);
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully.');

    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      // Re-throw the error so the calling function knows it failed
      throw new Error('Failed to send email.');
    }
  }
}

export default new EmailService();
