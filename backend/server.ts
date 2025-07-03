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
const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

  } catch (error) {
    console.error('Database connection error:', error);
    if (retries > 0) {
      `);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    throw error;
  }
};

// Startup health check
const performStartupChecks = () => {

  // Check required environment variables
  const requiredVars = ['JWT_SECRET', 'MONGO_URI'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using default values for development');
  }

};

// Start server with better error handling
const startServer = async () => {
  try {
    performStartupChecks();
    
    await connectDB();
    
    const server = createServer(app);
    
    // Initialize WebSocket only if available
    try {
      const websocketService = await import('./services/websocketService');
      websocketService.default.initialize(server);

    } catch (wsError: any) {
      console.warn('⚠ WebSocket service not available:', wsError?.message || 'Unknown error');
    }
    
    server.listen(PORT, () => {

    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {

      server.close(() => {

        mongoose.connection.close().then(() => {

          process.exit(0);
        }).catch(() => {
          process.exit(0);
        });
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();