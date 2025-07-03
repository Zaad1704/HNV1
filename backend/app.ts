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
import contactRoutes from './routes/contactRoutes';
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
  'https://hnv.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS Origin:', origin || 'undefined (direct API call)');
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow render.com domains
    if (origin.includes('.onrender.com') || origin.includes('hnvpm.com')) {
      return callback(null, true);
    }
    
    console.warn('CORS blocked origin:', origin);
    callback(null, true); // Allow all for now to fix production
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Version', 'X-Request-Time'],
  preflightContinue: false,
  optionsSuccessStatus: 204
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

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Client-Version, X-Request-Time');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Debug middleware for all API routes - MUST BE FIRST
app.use('/api', (req, res, next) => {
  console.log(`API Request: ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers.authorization ? 'Has Auth' : 'No Auth');
  next();
});

// Test routes (no auth required)
app.use('/api/test', require('./routes/testRoutes').default);

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
app.use('/api/forgot-password', passwordResetRoutes, routeErrorHandler);
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
app.use('/api/public', publicRoutes, routeErrorHandler);
app.use('/api/contact', contactRoutes, routeErrorHandler);

// Apply subscription middleware to protected routes - temporarily disabled to fix 403 errors
// app.use('/api/properties', checkSubscriptionStatus);
// app.use('/api/tenants', checkSubscriptionStatus);
// app.use('/api/payments', checkSubscriptionStatus);

// Protected routes (require authentication)
app.use('/api/dashboard', protect, dashboardRoutes, routeErrorHandler);
app.use('/api/properties', protect, propertiesRoutes);
app.use('/api/tenants', protect, tenantsRoutes);
app.use('/api/payments', protect, paymentsRoutes);
app.use('/api/expenses', protect, expenseRoutes);
app.use('/api/maintenance', protect, maintenanceRoutes);
app.use('/api/cashflow', protect, cashFlowRoutes, routeErrorHandler);
app.use('/api/invites', protect, require('./routes/inviteRoutes').default);
app.use('/api/invite', protect, require('./routes/inviteRoutes').default);
app.use('/api/reminders', protect, reminderRoutes);
app.use('/api/edit-requests', protect, editRequestRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/invitations', protect, invitationRoutes);
app.use('/api/billing', protect, billingRoutes);
app.use('/api/audit', protect, auditRoutes);
app.use('/api/org', protect, orgRoutes);
app.use('/api/organization', protect, orgRoutes);
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
