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
import subscriptionsRoutes from './routes/subscriptionsRoutes';
import auditRoutes from './routes/auditRoutes';
import setupRoutes from './routes/setupRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import planRoutes from './routes/planRoutes';
import billingRoutes from './routes/billingRoutes'; // <-- ADD THIS LINE

dotenv.config();

const app: Express = express();

const connectDB = async () => { /* ... */ };
connectDB();

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com' 
];

const corsOptions: CorsOptions = { /* ... */ };
app.use(cors(corsOptions));

// FIX: Add a special case for the raw webhook route BEFORE express.json()
// Webhooks need the raw request body for signature verification.
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// --- Mount API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/billing', billingRoutes); // <-- ADD THIS LINE
// ... and all other app.use() statements for your routes

app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
