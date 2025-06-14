// backend/server.ts

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet'; // FIX: Import helmet - ESSENTIAL for CSP

// --- Import API Route Files ---
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import propertiesRoutes from './routes/propertiesRoutes';
import tenantsRoutes from './routes/tenantsRoutes';
import paymentsRoutes from './routes/paymentsRoutes';
import userRoutes from './routes/userRoutes';
import subscriptionsRoutes from './routes/subscriptionsRoutes'; // FIX: Import the new subscriptionsRoutes
import auditRoutes from './routes/auditRoutes'; // FIX: Import the new auditRoutes
import setupRoutes from './routes/setupRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import planRoutes from './routes/planRoutes';

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
  'https://hnv.onrender.com' // FIX: Ensure your deployed frontend URL is precisely 'https://hnv.onrender.com'
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

// FIX: Configure Helmet's Content Security Policy - THIS IS CRITICAL FOR YOUR FRONTEND TO LOAD
// This addresses the CSP errors you were seeing in the browser console.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow scripts from self and inline scripts (often needed for React/Vite/bundlers)
      styleSrc: ["'self'", "'unsafe-inline'"],  // Allow styles from self and inline styles (often needed for Tailwind CSS/bundlers)
      imgSrc: ["'self'", "data:", "https:", "http:"], // Allow images from self, data URIs, HTTPS/HTTP sources (e.g., for placeholders, external images)
      connectSrc: [
        "'self'",
        "https://hnv.onrender.com", // Your frontend domain, allowing it to connect to itself
        "https://hnv.onrender.com/api" // Your backend API endpoint
      ],
      // Add other directives if you encounter more errors (e.g., font-src for custom fonts, media-src for video/audio)
      // Note: 'unsafe-inline' should be used with caution in production. For higher security, consider using nonces or hashes for inline content.
    },
  },
  // If you need to allow PWA manifest or other specific headers that Helmet might block by default, configure them here.
}));


// --- Mount API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionsRoutes); // FIX: Mount the new subscriptionsRoutes
app.use('/api/audit', auditRoutes); // FIX: Mount the new auditRoutes
app.use('/api/setup', setupRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);


// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
