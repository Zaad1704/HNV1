// backend/server.ts

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';

// --- Import All API Route Files ---
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import userRoutes from './routes/userRoutes';
import subscriptionsRoutes from './routes/subscriptionsRoutes';
import auditRoutes from './routes/auditRoutes';
import setupRoutes from './routes/setupRoutes'; // Corrected import for consistency
import feedbackRoutes from './routes/feedbackRoutes';
import planRoutes from './routes/planRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';


dotenv.config();

const app: Express = express();

// --- Database Connection ---
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
    // Exit process with failure
    process.exit(1);
  }
};
connectDB();

// --- CORS Configuration ---
const allowedOrigins: string[] = [
  'http://localhost:3000',                // For local development
  'https://hnv-1-frontend.onrender.com'    // Your exact frontend production URL
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

// --- Security Middleware ---
app.use(express.json());
app.use(helmet()); // Sets important security headers

// Example of a more specific Content Security Policy with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Can add other trusted script sources here
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles if needed
      imgSrc: ["'self'", "data:", "https:"], // Allow images from self, data URIs, and https
      connectSrc: [
        "'self'",
        "https://hnv-1-frontend.onrender.com",
        "https://hnv.onrender.com", // Assuming this is your backend URL
      ],
    },
  },
}));


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


// --- Health-Check Route ---
app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

// --- Server Initialization ---
const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// Export 'app' for potential use in other parts of the project (e.g., for testing)
export default app;
