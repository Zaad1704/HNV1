import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';

// --- Import API Route Files ---
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
import dashboardRoutes from './routes/dashboardRoutes'; // <-- IMPORT THE NEW ROUTE

dotenv.config();

const app: Express = express();

const connectDB = async () => { 
    // This function should contain your mongoose.connect() logic
};
connectDB();

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com' 
];

const corsOptions: CorsOptions = { 
    origin: allowedOrigins
};
app.use(cors(corsOptions));

// Special case for the raw webhook route BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// --- Mount API Routes ---
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
app.use('/api/dashboard', dashboardRoutes); // <-- MOUNT THE NEW ROUTE
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/setup', setupRoutes);


app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
