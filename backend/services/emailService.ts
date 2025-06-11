// FILE: backend/services/emailService.ts
import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // In a real app, these would come from process.env
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'YOUR_ETHEREAL_USER', // Replace with Ethereal credentials or other provider
        pass: 'YOUR_ETHEREAL_PASSWORD',
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Your Verification Code';
    const html = `<p>Your verification code is: <strong>${otp}</strong></p>`;
    console.log(`Sending OTP ${otp} to ${to}`);
    // await this.transporter.sendMail({ from: '"HNV" <no-reply@hnv.com>', to, subject, html });
  }
}

export default new EmailService();

