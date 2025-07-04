import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { app } from './app';

// Load environment variables
dotenv.config();

// Environment validation with defaults for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hnv-dev';
const PORT = process.env.PORT || 5001;

// Database connection with retry logic
const connectDB = async (retries = 5) => { try { }
    const conn = await mongoose.connect(MONGO_URI, {

      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

  } catch (error) { console.error('Database connection error:', error);
    if (retries > 0) { }


      console.log(`Retrying database connection... (${retries} attempts left)`