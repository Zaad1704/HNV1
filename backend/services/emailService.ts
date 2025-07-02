import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

class EmailService {
  private transporter: any = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = 'HNV Property Management <noreply@hnvmp.com>';
    
    console.log('Email service initializing with SMTP...');
    console.log('EMAIL_FROM:', this.fromEmail);
    
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 587,
        secure: false,
        auth: {
          user: 'zaad4041@gmail.com',
          pass: 're_XvHZC6Yu_9ooAM3EzTPUcujUjXJx72zNX'
        }
      });
      console.log('✅ SMTP email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendEmail(to: string, subject: string, templateName: string, templateData: Record<string, string>) {
    console.log(`📧 Attempting to send email to ${to}: ${subject}`);
    
    if (!this.transporter) {
      console.log(`❌ Email service disabled - would send to ${to}: ${subject}`);
      return;
    }

    try {
      const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
      let htmlContent = fs.readFileSync(templatePath, 'utf-8');

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
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw new Error('Failed to send email.');
    }
  }

  async sendContactForm(formData: { name: string; email: string; subject: string; message: string }) {
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
        to: 'zaad4041@gmail.com',
        subject: `Contact Form: ${formData.subject}`,
        html: htmlContent,
        replyTo: formData.email
      });
    } catch (error) {
      console.error('Error sending contact form email:', error);
      throw new Error('Failed to send contact form.');
    }
  }
}

export default new EmailService();