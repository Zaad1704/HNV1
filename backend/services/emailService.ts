import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: process.env.ETHEREAL_USER, pass: process.env.ETHEREAL_PASS },
    });
  }
  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Your Verification Code for HNV SaaS';
    const html = `<p>Your verification code is: <strong>${otp}</strong>.</p>`;
    console.log(`Simulating OTP email to ${to} with code ${otp}`);
  }
}
export default new EmailService();
