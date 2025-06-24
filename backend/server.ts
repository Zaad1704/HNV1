import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';

// This line executes the file and registers the Google strategy with Passport.
import './config/passport-setup'; 

// --- Import API Route Files ---
import authRoutes from './routes/authRoutes';
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

// FINAL FIX: Add ALL frontend domains, including your custom domain (with and without www)
// and the Render-provided URL. This is the most robust solution.
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com', 
  'https://www.hnvpm.com',
  'https://hnvpm.com'
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
// app.use(helmet()); // <--- Commented out as requested
app.use(passport.initialize());

// --- Mount API Routes ---
// (All app.use(...) calls for your routes go here)
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
