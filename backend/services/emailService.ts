import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email service not configured - skipping email send');
        return { success: false, message: 'Email service not configured' };
      }

      const mailOptions = {
        from: options.from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <h1>Welcome to HNV Property Management!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to help you manage your properties efficiently.</p>
      <p>Best regards,<br>The HNV Team</p>
    `;

    return this.sendEmail({
      to,
      subject: 'Welcome to HNV Property Management',
      html
    });
  }

  async sendVerificationEmail(to: string, token: string, userName?: string) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      
      // Read HTML template
      const templatePath = path.join(__dirname, '../templates/emailVerification.html');
      let html = fs.readFileSync(templatePath, 'utf8');
      
      // Replace placeholders
      html = html.replace('{{userName}}', userName || 'User');
      html = html.replace('{{verificationUrl}}', verificationUrl);
      
      return this.sendEmail({
        to,
        subject: 'Verify Your Email Address - HNV Property Management',
        html
      });
    } catch (error) {
      console.error('Error reading email template:', error);
      // Fallback to simple HTML
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Verify Your Email Address</h1>
          <p>Hello ${userName || 'User'},</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `;
      
      return this.sendEmail({
        to,
        subject: 'Verify Your Email Address - HNV Property Management',
        html
      });
    }
  }
}

export default new EmailService();
