// backend/server.ts
import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import passport from 'passport';

// This line executes the file and registers the Google strategy with Passport.
import './config/passport-setup'; 

// --- Import API Route Files ---
import authRoutes from './routes/authRoutes';
import billingRoutes from './routes/billingRoutes'; // <--- FIX: Import billingRoutes
import superAdminRoutes from './routes/superAdminRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import userRoutes from './routes/userRoutes';
import subscriptionsRoutes from './routes/subscriptionsRoutes'; 
import auditRoutes from './routes/auditRoutes'; 
import setupRoutes from './routes/setupRoutes'; 
import feedbackRoutes from './routes/feedbackRoutes';
import planRoutes from './routes/planRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes'; 
import cashFlowRoutes from './routes/cashFlowRoutes'; 
import communicationRoutes from './routes/communicationRoutes'; 
import dashboardRoutes from './routes/dashboardRoutes'; 
import editRequestRoutes from './routes/editRequestRoutes'; 
import fileUploadRoutes from './routes/fileUploadRoutes'; 
import invoiceRoutes from './routes/invoiceRoutes'; 
import invitationRoutes from './routes/invitationRoutes'; 
import localizationRoutes from './routes/localizationRoutes'; 
import notificationRoutes from './routes/notificationRoutes'; 
import orgRoutes from './routes/orgRoutes'; 
import passwordResetRoutes from './routes/passwordResetRoutes'; 
import receiptRoutes from './routes/receiptRoutes'; 
import reminderRoutes from './routes/reminderRoutes'; 
import reportRoutes from './routes/reportRoutes'; 
import siteSettingsRoutes from './routes/siteSettingsRoutes'; 
import sharingRoutes from './routes/sharingRoutes'; 
import tenantPortalRoutes from './routes/tenantPortalRoutes'; 
import uploadRoutes from './routes/uploadRoutes';
import expenseRoutes from './routes/expenseRoutes';
import translationRoutes from './routes/translationRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './services/logger';
import compression from 'compression';

dotenv.config();

const app: Express = express();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err: unknown) {
    if (err instanceof Error) {
        console.error(err.message);
    } else {
        console.error('An unknown error occurred during database connection.');
    }
    process.exit(1);
  }
};
connectDB();

// Dynamically configure CORS allowed origins from environment variable
const allowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
const allowedOrigins: string[] = allowedOriginsEnv ? allowedOriginsEnv.split(',') : [];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`)); // Improved error message
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(passport.initialize());

// --- Mount API Routes ---
// (All app.use(...) calls for your routes go here)
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes); // <--- FIX: Mount the billing routes
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/setup', setupRoutes); 
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/maintenance', maintenanceRoutes); 
app.use('/api/cashflow', cashFlowRoutes); 
app.use('/api/communication', communicationRoutes); 
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/edit-requests', editRequestRoutes); 
app.use('/api/file-upload', fileUploadRoutes); 
app.use('/api/invoices', invoiceRoutes); 
app.use('/api/invitations', invitationRoutes); 
app.use('/api/localization', localizationRoutes); 
app.use('/api/notifications', notificationRoutes); 
app.use('/api/orgs', orgRoutes); 
app.use('/api/password-reset', passwordResetRoutes); 
app.use('/api/receipts', receiptRoutes); 
app.use('/api/reminders', reminderRoutes); 
app.use('/api/reports', reportRoutes); 
app.use('/api/site-settings', siteSettingsRoutes); 
app.use('/api/sharing', sharingRoutes); 
app.use('/api/tenant-portal', tenantPortalRoutes); 
app.use('/api/upload', uploadRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/health', healthRoutes); 

// A simple health-check route
app.get('/', ((req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
}) as RequestHandler);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
