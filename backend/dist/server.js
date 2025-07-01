const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'HNV Property Management Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'HNV Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'HNV Backend is running successfully!', 
    version: '1.0.0',
    features: [
      'Property Management',
      'Tenant Management', 
      'Payment Processing',
      'Multi-tenant SaaS',
      'Real-time Notifications'
    ]
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({ success: false, message: 'Login endpoint - under construction' });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ success: false, message: 'Register endpoint - under construction' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ success: false, message: 'Auth check endpoint - under construction' });
});

// Landing page stats
app.get('/api/landing-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: 1250,
      totalTenants: 3400,
      totalRevenue: 2500000,
      activeUsers: 850
    }
  });
});

// Site settings
app.get('/api/site-settings/public', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      logo: '/logo-min.png',
      theme: 'default'
    }
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'HNV Property Management API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log('⚠️  MongoDB URI not provided - running without database');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // Don't exit in production, continue without DB for basic functionality
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  const server = createServer(app);
  
  server.listen(PORT, () => {
    console.log('🚀 HNV Property Management Backend');
    console.log('=====================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ API status: http://localhost:${PORT}/api/status`);
    console.log('=====================================');
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
};

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});