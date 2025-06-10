import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';

// --- Corrected Import API Route Files (based on your repository) ---
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import billingRoutes from './routes/billingRoutes';
import invitationRoutes from './routes/invitationRoutes';
import orgRoutes from './routes/orgRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import userRoutes from './routes/userRoutes';
// The 'index.ts' file is likely the main entry for your routes, let's use that.
import allApiRoutes from './routes/index'; 


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

// --- Mount API Routes (using the files from your repository) ---
// The main router file is likely index.ts, which handles all sub-routes.
app.use('/api', allApiRoutes);


// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
