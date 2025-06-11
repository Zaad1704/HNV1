import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || 'your_ethereal_user',
        pass: process.env.ETHEREAL_PASS || 'your_ethereal_password'
      },
    });
  }
  async sendEmail(to: string, subject: string, html: string) {
    console.log(`Simulating sending email to ${to}`);
    // In production, uncomment the line below
    // await this.transporter.sendMail({ from: '"HNV" <no-reply@hnv.com>', to, subject, html });
  }
}
export default new EmailService();
