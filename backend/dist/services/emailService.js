"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        this.transporter = null;
    }
}
isConfigured();
boolean;
{
    return !!this.transporter;
}
constructor();
{
    this.fromEmail = 'HNV Property Management <noreply@hnvmp.com>';
    try { }
    finally {
    }
    this.transporter = nodemailer_1.default.createTransport({ host: process.env.SMTP_HOST || 'smtp.resend.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {},
        user: process.env.SMTP_USER || 'resend',
        pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY
    });
}
try { }
catch (error) {
    console.error('❌ Failed to initialize email service:', error);
}
async;
sendEmail(to, string, subject, string, templateName, string, templateData, (Record));
{
    if (!this.transporter) { }
    throw new Error('Email service not configured');
    try {
        let htmlContent = '';
        try { }
        finally {
        }
        const templatePath = path_1.default.join(__dirname, '..', 'templates', `${templateName}.html`);
        htmlContent = fs_1.default.readFileSync(templatePath, 'utf8');
    }
    catch (templateError) {
        ` }

        console.warn(`;
        Template;
        $;
        {
            templateName;
        }
        not;
        found, using;
        fallback `);`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${templateData.subject || 'Notification'}</h2>`;
        $;
        {
            Object.entries(templateData).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`).join('');
        }
        /div>` `;

      // Replace template variables
      Object.entries(templateData).forEach(([key, value]) => { `;
    }
    const regex = new RegExp(`{{${key}}}`, 'g');
    htmlContent = htmlContent.replace(regex, value);
}
;
const mailOptions = { from: this.fromEmail,
    to,
    subject,
    html: htmlContent };
;
await this.transporter.sendMail(mailOptions);
`
      console.log(`;
Email;
sent;
successfully;
to;
$;
{
    to;
}
`);
    } catch (error) { `;
console.error(`Error sending email to ${to}:`, error);
`
      throw new Error(`;
Failed;
to;
send;
email: $;
{
    error;
}
`);


  async sendContactForm(formData: any) { `;
const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Contact Form Submission</h2> }

        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${formData.company || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
      </div>` `;

    const mailOptions = { from: this.fromEmail,
      to: 'contact@hnvpm.com',`;
subject: `Contact Form: ${formData.subject || 'New Inquiry'}`,
    html;
htmlContent;
;
await this.transporter.sendMail(mailOptions);
exports.default = new EmailService();
`;
