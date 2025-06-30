// backend/app.ts

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import { securityHeaders, createRateLimit, sanitizeInput, requestLogger } from './middleware/securityMiddleware';
import { errorHandler } from './middleware/errorHandler';

// Import route files
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import invitationRoutes from './routes/invitationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import expenseRoutes from './routes/expenseRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import cashFlowRoutes from './routes/cashFlowRoutes';
import reminderRoutes from './routes/reminderRoutes';
import editRequestRoutes from './routes/editRequestRoutes';
import userRoutes from './routes/userRoutes';
import billingRoutes from './routes/billingRoutes';
import auditRoutes from './routes/auditRoutes';
import orgRoutes from './routes/orgRoutes';
import subscriptionsRoutes from './routes/subscriptionsRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import setupRoutes from './routes/setupRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import notificationRoutes from './routes/notificationRoutes';
import communicationRoutes from './routes/communicationRoutes';
import sharingRoutes from './routes/sharingRoutes';
import siteSettingsRoutes from './routes/siteSettingsRoutes';
import localizationRoutes from './routes/localizationRoutes';
import translationRoutes from './routes/translationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import fileUploadRoutes from './routes/fileUploadRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import receiptRoutes from './routes/receiptRoutes';
import reportRoutes from './routes/reportRoutes';
import planRoutes from './routes/planRoutes';
import { protect } from './middleware/authMiddleware';
import passport from 'passport';
import './config/passport-setup'; // Initialize passport strategies

// Create the Express app instance
const app: Express = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// --- Security Middleware Setup ---
// Enhanced security headers
app.use(securityHeaders);
// Compression
app.use(compression());
// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
// Rate limiting - more restrictive for auth endpoints
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 10)); // 10 requests per 15 minutes
app.use('/api', createRateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes
// Prevent NoSQL injection
app.use(mongoSanitize());
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Passport middleware
app.use(passport.initialize());
// Input sanitization
app.use(sanitizeInput);
// Request logging
app.use(requestLogger);

// --- Route Setup ---
// Health check routes (no auth required)
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/plans', planRoutes);

// Protected routes (require authentication)
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/properties', protect, propertiesRoutes);
app.use('/api/tenants', protect, tenantsRoutes);
app.use('/api/payments', protect, paymentsRoutes);
app.use('/api/expenses', protect, expenseRoutes);
app.use('/api/maintenance', protect, maintenanceRoutes);
app.use('/api/cashflow', protect, cashFlowRoutes);
app.use('/api/reminders', protect, reminderRoutes);
app.use('/api/edit-requests', protect, editRequestRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/invitations', protect, invitationRoutes);
app.use('/api/billing', protect, billingRoutes);
app.use('/api/audit', protect, auditRoutes);
app.use('/api/org', protect, orgRoutes);
app.use('/api/subscriptions', protect, subscriptionsRoutes);
app.use('/api/super-admin', protect, superAdminRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/communication', protect, communicationRoutes);
app.use('/api/sharing', protect, sharingRoutes);
app.use('/api/upload', protect, uploadRoutes);
app.use('/api/file-upload', protect, fileUploadRoutes);
app.use('/api/invoices', protect, invoiceRoutes);
app.use('/api/receipts', protect, receiptRoutes);
app.use('/api/reports', protect, reportRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Export the configured app
export { app };
