// backend/server.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Environment Variable Checks ---
if (!MONGO_URI) {
  throw new Error('FATAL ERROR: MONGO_URI must be defined in your .env file');
}

// This check ensures the app only starts if a secret is available
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET must be defined in your .env file');
}

// --- Database Connection and Server Start ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
