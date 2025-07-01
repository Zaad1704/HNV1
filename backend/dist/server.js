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

// Create default super admin user
const createDefaultAdmin = () => {
  const adminUser = {
    id: 'admin-001',
    name: 'Super Admin',
    email: 'admin@hnvpm.com',
    password: 'admin123',
    role: 'SuperAdmin',
    createdAt: new Date().toISOString()
  };
  users.set('admin@hnvpm.com', adminUser);
  
  // Also create a demo user
  const demoUser = {
    id: 'demo-001',
    name: 'Demo User',
    email: 'demo@hnvpm.com',
    password: 'demo123',
    role: 'Landlord',
    createdAt: new Date().toISOString()
  };
  users.set('demo@hnvpm.com', demoUser);
  
  console.log('✅ Default users created:');
  console.log('   Admin: admin@hnvpm.com / admin123');
  console.log('   Demo: demo@hnvpm.com / demo123');
};

// Initialize default users
createDefaultAdmin();

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'Landlord' } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password required' });
  }
  
  if (users.has(email.toLowerCase())) {
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
  
  users.set(email.toLowerCase(), user);
  
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
  
  console.log(`🔑 Login attempt: ${email}`);
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  
  const user = users.get(email.toLowerCase());
  if (!user) {
    console.log(`❌ User not found: ${email}`);
    console.log('Available users:', Array.from(users.keys()));
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  if (user.password !== password) {
    console.log(`❌ Wrong password for: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
  sessions.set(token, user);
  
  console.log(`✅ Login successful: ${email}`);
  
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

// Google OAuth routes
app.get('/api/auth/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'}` +
    `&redirect_uri=${encodeURIComponent(process.env.BACKEND_URL || 'https://hnv.onrender.com')}/api/auth/google/callback` +
    `&response_type=code` +
    `&scope=email profile` +
    `&access_type=offline`;
  
  res.redirect(googleAuthUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || 'https://hnv-1-frontend.onrender.com'}/login?error=oauth_failed`);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BACKEND_URL || 'https://hnv.onrender.com'}/api/auth/google/callback`
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('No access token received');
    }
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const googleUser = await userResponse.json();
    
    // Find or create user
    let user = users.get(googleUser.email);
    if (!user) {
      user = {
        id: Date.now().toString(),
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        role: 'Landlord',
        createdAt: new Date().toISOString()
      };
      users.set(googleUser.email, user);
    }
    
    // Create session
    const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
    sessions.set(token, user);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'https://hnv-1-frontend.onrender.com'}/auth/google/callback?token=${token}`);
    
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'https://hnv-1-frontend.onrender.com'}/login?error=oauth_failed`);
  }
});

// Landing page stats - enhanced
app.get('/api/landing-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: 1250,
      totalTenants: 3400,
      totalRevenue: 2500000,
      activeUsers: 850,
      countriesServed: 25,
      uptimeGuarantee: '99.9%',
      monthlyGrowth: 15.2,
      customerSatisfaction: 4.8
    }
  });
});

// Additional stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      properties: 1250,
      tenants: 3400,
      revenue: 2500000,
      users: 850,
      growth: 15.2
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
      theme: 'default',
      companyName: 'HNV Solutions',
      tagline: 'Modern Property Management Platform',
      supportEmail: 'support@hnvpm.com'
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

// Public settings endpoint
app.get('/api/public', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      companyName: 'HNV Solutions',
      logo: '/logo-min.png',
      tagline: 'Modern Property Management Platform',
      features: {
        propertyManagement: true,
        tenantPortal: true,
        paymentProcessing: true,
        maintenanceTracking: true,
        financialReporting: true
      },
      stats: {
        totalProperties: 1250,
        totalTenants: 3400,
        totalRevenue: 2500000,
        activeUsers: 850
      }
    }
  });
});

// Additional common endpoints
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      apiVersion: '1.0.0',
      features: ['auth', 'properties', 'tenants', 'payments'],
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

app.get('/api/version', (req, res) => {
  res.json({
    success: true,
    version: '1.0.0',
    build: Date.now()
  });
});

// Catch-all for missing API routes
app.use('/api/*', (req, res) => {
  console.log(`⚠️ Missing API endpoint: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
    availableEndpoints: [
      '/api/health',
      '/api/status', 
      '/api/public',
      '/api/landing-stats',
      '/api/site-settings/public',
      '/api/auth/login',
      '/api/auth/register'
    ],
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
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://hnv.onrender.com' : `http://localhost:${PORT}`;
    console.log('🚀 HNV Property Management Backend');
    console.log('=====================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: ${baseUrl}/health`);
    console.log(`✅ API status: ${baseUrl}/api/status`);
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