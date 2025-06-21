// backend/server.ts

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import helmet from 'helmet'; // Added helmet for security headers

// This line is crucial - it runs the configuration in passport-setup.ts
import './config/passport-setup';

// Route imports
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import userRoutes from './routes/userRoutes';
import auditRoutes from './routes/auditRoutes';
import setupRoutes from './routes/setupRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import planRoutes from './routes/planRoutes';
import billingRoutes from './routes/billingRoutes';
import siteSettingsRoutes from './routes/siteSettingsRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import translationRoutes from './routes/translationRoutes';
import invitationRoutes from './routes/invitationRoutes';
import sharingRoutes from './routes/sharingRoutes';
import expenseRoutes from './routes/expenseRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import localizationRoutes from './routes/localizationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import uploadRoutes from './routes/uploadRoutes';
import notificationRoutes from './routes/notificationRoutes'; // FIX: Ensure notificationsRoutes is imported
import orgRoutes from './routes/orgRoutes'; // FIX: Ensure orgRoutes is imported (will correct content next)
import invoiceRoutes from './routes/invoiceRoutes'; // FIX: Ensure invoiceRoutes is imported
import receiptRoutes from './routes/receiptRoutes'; // FIX: Ensure receiptRoutes is imported
import tenantPortalRoutes from './routes/tenantPortalRoutes'; // FIX: Ensure tenantPortalRoutes is imported
import communicationRoutes from './routes/communicationRoutes'; // FIX: Ensure communicationRoutes is imported


dotenv.config();

const app: Express = express();

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    process.exit(1);
  }
};
connectDB();

// CORS Configuration
const allowedOrigins: string[] = [
  process.env.CORS_ORIGIN || '',
  'http://localhost:3000',
  'https://hnv-saas-frontend.onrender.com' // Ensure your Render frontend URL is here
].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  // Allow common methods and headers for API calls
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization,X-Org-Id', // X-Org-Id for organization context
};

app.use(cors(corsOptions));
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data
// Serve static files from the 'public' directory (for uploads, shared documents)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'))); // FIX: Explicitly serve /uploads
app.use(express.static(path.join(__dirname, '..', 'public')));


// NEW: Session and Passport Middleware
if (!process.env.SESSION_SECRET) {
    console.error("FATAL ERROR: SESSION_SECRET is not defined in .env file.");
    // In production, you might want to exit, but for dev, you could default to a string
    // process.exit(1);
}
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkeyforlocaldev', // Fallback for development
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevent client-side JS from accessing cookies
        sameSite: 'lax', // Protect against CSRF
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet()); // Apply security headers


// API Routes - FIX: Ensure ALL relevant routes are mounted
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/share', sharingRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes); // FIX: Mount notifications route
app.use('/api/orgs', orgRoutes); // FIX: Mount orgs route (will fix its content next)
app.use('/api/invoices', invoiceRoutes); // FIX: Mount invoices route
app.use('/api/receipts', receiptRoutes); // FIX: Mount receipts route
app.use('/api/tenant-portal', tenantPortalRoutes); // FIX: Mount tenant portal route
app.use('/api/communication', communicationRoutes); // FIX: Mount communication route


app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running');
});

// FIX: Global Error Handler - It should be the last middleware
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
