import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import passport from 'passport'; // FIX: Import passport

// --- Import Passport Setup ---
// This line executes the file and registers the Google strategy with Passport.
import './config/passport-setup'; 

// --- Import API Route Files ---
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
// ... (all other route imports) ...
import tenantPortalRoutes from './routes/tenantPortalRoutes';
import uploadRoutes from './routes/uploadRoutes';

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

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com'
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());

// FIX: Initialize Passport middleware
app.use(passport.initialize());


// --- Mount API Routes ---
app.use('/api/auth', authRoutes);
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

// A simple health-check route
app.get('/', ((req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
}) as RequestHandler);

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
