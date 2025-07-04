import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { startSubscriptionCron } from './scripts/subscriptionCron';

// Load environment variables
dotenv.config();

// Environment validation with defaults for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://rajputragav420:5EIWHghGDZ4rEpmr@hnv.qw1lakw.mongodb.net/hnv?retryWrites=true&w=majority&appName=HNV';
const PORT = process.env.PORT || 5001;

console.log('MongoDB URI:', MONGO_URI ? 'Set' : 'Not set');
console.log('Environment:', process.env.NODE_ENV);

// Database connection with retry logic
const connectDB = async (retries = 5): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    if (retries > 0) {
      console.log(`Retrying database connection... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('Failed to connect to database after multiple attempts');
      process.exit(1);
    }
  }
};

// Create HTTP server
const server = createServer(app);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
    process.exit(0);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      
      // Start subscription cron job
      if (process.env.NODE_ENV !== 'test') {
        startSubscriptionCron();
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();