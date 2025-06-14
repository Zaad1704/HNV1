// backend/server.ts

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
import feedbackRoutes from './routes/feedbackRoutes'; // Import the new feedback routes

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
  }
};
app.use(cors(corsOptions));

app.use(express.json());

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
app.use('/api/feedback', feedbackRoutes); // Mount the new feedback routes


// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
