import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import mongoose from 'mongoose';

// --- Main Route Handler ---
// We import the main router from 'index.ts' which should handle all other routes.
import allApiRoutes from './routes/index'; 

// --- Special Setup Route ---
// This is imported separately because it serves a special, one-time purpose.
import setupRoutes from './routes/setupRoutes';


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
// The main router file handles all standard API routes.
app.use('/api', allApiRoutes);
// The special setup route is mounted separately.
app.use('/api/setup', setupRoutes);


// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT: string | number = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

export default app;
