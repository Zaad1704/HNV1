import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

class EmailService {
  private transporter: any = null;
  private fromEmail: string;

  isConfigured(): boolean {
    return !!this.transporter;

  constructor() {
    this.fromEmail = 'HNV Property Management <noreply@hnvmp.com>';

    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.resend.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'resend',
          pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY

      });

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);


  async sendEmail(to: string, subject: string, templateName: string, templateData: Record<string, string>) {

    if (!this.transporter) {

      throw new Error('Email service not configured');

    try {
      let htmlContent = '';
      
      try {
        const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html
        console.warn(`Template ${templateName} not found, using fallback
        htmlContent = 
              ${Object.entries(templateData).map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>
        
        const regex = new RegExp(`{{${key}}}
      console.error(`Error sending email to ${to}:
      throw new Error(
      const htmlContent = 
      
        subject: `Contact Form: ${formData.subject}