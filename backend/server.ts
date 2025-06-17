import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import './config/passport-setup';

// --- Import All API Route Files ---
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
import tenantPortalRoutes from './routes/tenantPortalRoutes';
import communicationRoutes from './routes/communicationRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import siteSettingsRoutes from './routes/siteSettingsRoutes';
import fileUploadRoutes from './routes/fileUploadRoutes';
import expenseRoutes from './routes/expenseRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import reportRoutes from './routes/reportRoutes'; // <-- IMPORT NEW ROUTE

dotenv.config();

const app: Express = express();

const connectDB = async () => { 
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('MongoDB Connected...');
    } catch (err: any) {
        console.error(err.message);
        process.exit(1);
    }
};
connectDB();

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com' 
];

const corsOptions: CorsOptions = { 
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));

// --- Initialize Middleware ---
app.use(passport.initialize());
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// --- Mount All API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/tenant-portal', tenantPortalRoutes);
app.use('/api/communicate', communicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/maintenance-requests', maintenanceRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes); // <-- MOUNT NEW ROUTE
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/setup', setupRoutes);


// Root health check route
app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
