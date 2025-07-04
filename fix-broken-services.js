const fs = require('fs');
const path = require('path');

// Fix auditService.ts
const auditServiceContent = `import AuditLog from '../models/AuditLog';

interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  details?: any;
}

export const logAudit = async (data: AuditLogData) => {
  try {
    const auditLog = new AuditLog({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      details: data.details,
      timestamp: new Date()
    });
    
    await auditLog.save();
    console.log('Audit log created successfully');
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export default {
  logAudit
};
`;

// Fix emailService.ts
const emailServiceContent = `import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransporter({
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
    const html = \`
      <h1>Welcome to HNV Property Management!</h1>
      <p>Hello \${name},</p>
      <p>Thank you for joining our platform. We're excited to help you manage your properties efficiently.</p>
      <p>Best regards,<br>The HNV Team</p>
    \`;

    return this.sendEmail({
      to,
      subject: 'Welcome to HNV Property Management',
      html
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = \`\${process.env.FRONTEND_URL}/verify-email/\${token}\`;
    const html = \`
      <h1>Verify Your Email</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="\${verificationUrl}">Verify Email</a>
      <p>This link will expire in 1 hour.</p>
    \`;

    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      html
    });
  }
}

export default new EmailService();
`;

// Fix logger.ts
const loggerContent = `import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'hnv-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
`;

// Write the fixed files
const servicesToFix = [
  { file: 'auditService.ts', content: auditServiceContent },
  { file: 'emailService.ts', content: emailServiceContent },
  { file: 'logger.ts', content: loggerContent }
];

servicesToFix.forEach(({ file, content }) => {
  const servicePath = path.join(__dirname, 'backend', 'services', file);
  
  try {
    console.log(`Fixing ${file}...`);
    fs.writeFileSync(servicePath, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } catch (error) {
    console.error(`❌ Failed to fix ${file}:`, error.message);
  }
});

console.log('🎉 Service fixing completed!');