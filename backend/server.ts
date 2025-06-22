// backend/server.ts

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import helmet from 'helmet'; 

// This line is crucial - it runs the configuration in passport-setup.ts
import './config/passport-setup';

// Route imports - FIX: Ensure all are imported correctly
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
import notificationRoutes from './routes/notificationRoutes'; 
import orgRoutes from './routes/orgRoutes'; 
import invoiceRoutes from './routes/invoiceRoutes'; 
import receiptRoutes from './routes/receiptRoutes'; 
import tenantPortalRoutes from './routes/tenantPortalRoutes'; 
import communicationRoutes from './routes/communicationRoutes'; 
// NEW IMPORT for G: CashFlow Routes
import cashFlowRoutes from './routes/cashFlowRoutes'; 


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
  'https://hnv-saas-frontend.onrender.com' 
].filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization,X-Org-Id',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'))); 
app.use(express.static(path.join(__dirname, '..', 'public')));


// Session and Passport Middleware
if (!process.env.SESSION_SECRET) {
    console.error("FATAL ERROR: SESSION_SECRET is not defined in .env file.");
}
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkeyforlocaldev', 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true, 
        sameSite: 'lax', 
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(helmet()); 


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
app.use('/api/notifications', notificationRoutes); 
app.use('/api/orgs', orgRoutes); 
app.use('/api/invoices', invoiceRoutes); 
app.use('/api/receipts', receiptRoutes); 
app.use('/api/tenant-portal', tenantPortalRoutes); 
app.use('/api/communication', communicationRoutes); 
// NEW ROUTE for G: Cash Flow
app.use('/api/cashflow', cashFlowRoutes); 


app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running');
});

// Global Error Handler
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
