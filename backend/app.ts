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
import errorRoutes from './routes/errorRoutes';
import publicRoutes from './routes/publicRoutes';
import exportRoutes from './routes/exportRoutes';
import rentCollectionRoutes from './routes/rentCollectionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import integrationRoutes from './routes/integrationRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import { checkSubscriptionStatus } from './middleware/subscriptionMiddleware';
import masterDataService from './services/masterDataService';
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
const allowedOrigins = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com',
  'https://hnv-property.onrender.com',
  'https://www.hnvpm.com',
  'https://hnvpm.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Version', 'X-Request-Time']
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
// Root route for health checks
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HNV Property Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'OK',
    origin: req.get('Origin'),
    userAgent: req.get('User-Agent'),
    headers: req.headers,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL
  });
});

// Health check routes (no auth required)
app.use('/api/health', healthRoutes);
app.use('/health', healthRoutes);

// Route error handler middleware
const routeErrorHandler = (err: any, req: any, res: any, next: any) => {
  console.error(`Route error in ${req.originalUrl}:`, err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  }
};

// Public routes with error handling
app.use('/api/auth', authRoutes, routeErrorHandler);
app.use('/api/setup', setupRoutes, routeErrorHandler);
app.use('/api/password-reset', passwordResetRoutes, routeErrorHandler);
app.use('/api/feedback', feedbackRoutes, routeErrorHandler);
app.use('/api/site-settings', siteSettingsRoutes, routeErrorHandler);
app.use('/api/localization', localizationRoutes, routeErrorHandler);
app.use('/api/translation', translationRoutes, routeErrorHandler);
app.use('/api/plans', planRoutes, routeErrorHandler);
app.use('/api/errors', errorRoutes, routeErrorHandler);
app.use('/api/export', exportRoutes, routeErrorHandler);
app.use('/api/rent-collection', rentCollectionRoutes, routeErrorHandler);
app.use('/api/analytics', analyticsRoutes, routeErrorHandler);
app.use('/api/integrations', integrationRoutes, routeErrorHandler);
app.use('/api/subscription', subscriptionRoutes, routeErrorHandler);

// Apply subscription middleware to protected routes
app.use('/api/properties', checkSubscriptionStatus);
app.use('/api/tenants', checkSubscriptionStatus);
app.use('/api/payments', checkSubscriptionStatus);
app.use('/api', publicRoutes, routeErrorHandler);

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
app.use('/api/errors', errorRoutes);

// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        method: req.method
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize system data
setTimeout(async () => {
  try {
    await masterDataService.initializeSystemData();
    console.log('✅ System data initialized');
  } catch (error) {
    console.error('❌ Failed to initialize system data:', error);
  }
}, 5000); // Wait 5 seconds for DB connection

// Export the configured app
export { app };
