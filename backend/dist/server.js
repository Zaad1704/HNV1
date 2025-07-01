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
  origin: ['https://hnv-1-frontend.onrender.com', 'https://www.hnvpm.com', 'http://localhost:3000'],
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

// In-memory user store (replace with database in production)
const users = new Map();
const sessions = new Map();

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'Landlord' } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password required' });
  }
  
  if (users.has(email)) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  
  const user = {
    id: Date.now().toString(),
    name,
    email,
    password, // In production, hash this
    role,
    createdAt: new Date().toISOString()
  };
  
  users.set(email, user);
  
  const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user.id, email })).toString('base64');
  sessions.set(token, user);
  
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  
  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user.id, email })).toString('base64');
  sessions.set(token, user);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const user = sessions.get(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  res.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
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

// Site settings - multiple endpoints
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

app.get('/api/site-settings', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      logo: '/logo-min.png',
      theme: 'default',
      features: ['property-management', 'tenant-portal', 'payments']
    }
  });
});

// Catch-all for missing API routes
app.use('/api/*', (req, res) => {
  console.log(`Missing API endpoint: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
    timestamp: new Date().toISOString()
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