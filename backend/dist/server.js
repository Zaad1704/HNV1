const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// Use built-in crypto for password hashing
const crypto = require('crypto');

// Add error handling for server startup
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ['https://hnv-1-frontend.onrender.com', 'https://www.hnvpm.com', 'https://hnvpm.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// User model schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Landlord' },
  googleId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Session storage
const sessions = new Map();
let isDBConnected = false;

// Health check routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'HNV Property Management Backend',
    version: '1.0.0',
    database: isDBConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'HNV Backend API',
    version: '1.0.0',
    database: isDBConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'HNV Property Management API is operational',
    database: isDBConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'HNV Backend is running successfully!', 
    version: '1.0.0',
    database: isDBConnected ? 'Connected' : 'Disconnected',
    features: [
      'Property Management',
      'Tenant Management', 
      'Payment Processing',
      'Multi-tenant SaaS',
      'Real-time Notifications'
    ]
  });
});

// Auth routes with fallback
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Landlord' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }
    
    if (!isDBConnected) {
      return res.status(503).json({ success: false, message: 'Database not available. Please try again later.' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role
    });
    
    await user.save();
    
    const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user._id, email: user.email })).toString('base64');
    sessions.set(token, user);
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`🔑 Login attempt: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    if (!isDBConnected) {
      return res.status(503).json({ success: false, message: 'Database not available. Please try again later.' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check password - support multiple formats
    let passwordMatch = false;
    
    // Try different password comparison methods
    if (user.password === password) {
      // Plain text match
      passwordMatch = true;
    } else if (user.password.startsWith('$2')) {
      // Bcrypt format - for now just log and reject (need proper bcrypt)
      console.log('Bcrypt password detected - cannot verify without bcrypt library');
      passwordMatch = false;
    } else if (user.password.length === 64) {
      // SHA256 hash
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      passwordMatch = user.password === hash;
    } else if (user.password.length === 32) {
      // Try MD5 hash
      try {
        const md5Hash = crypto.createHash('md5').update(password).digest('hex');
        passwordMatch = user.password === md5Hash;
      } catch (error) {
        console.error('MD5 hash error:', error);
        passwordMatch = false;
      }
    } else {
      // Unknown format - just try plain text
      passwordMatch = user.password === password;
    }
    
    if (!passwordMatch) {
      console.log(`❌ Wrong password for: ${email}`);
      console.log(`   Stored password format: ${user.password.length} chars, starts with: ${user.password.substring(0, 5)}`);
      console.log(`   Trying plain text, SHA256, and MD5 comparisons`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user._id, email: user.email })).toString('base64');
    sessions.set(token, user);
    
    console.log(`✅ Login successful: ${email}`);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
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
    data: { id: user._id || user.id, name: user.name, email: user.email, role: user.role }
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
      activeUsers: 850,
      countriesServed: 25,
      uptimeGuarantee: '99.9%',
      monthlyGrowth: 15.2,
      customerSatisfaction: 4.8
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
      companyName: 'HNV Solutions',
      tagline: 'Modern Property Management Platform',
      supportEmail: 'support@hnvpm.com',
      features: ['property-management', 'tenant-portal', 'payments']
    }
  });
});

// Plans endpoint
app.get('/api/plans/public', (req, res) => {
  res.json({
    success: true,
    data: {
      plans: [
        {
          id: 'starter',
          name: 'Starter',
          price: 0,
          features: ['Up to 5 properties', 'Basic tenant management', 'Email support'],
          popular: false
        },
        {
          id: 'professional',
          name: 'Professional', 
          price: 29,
          features: ['Up to 50 properties', 'Advanced reporting', 'Priority support', 'Mobile app'],
          popular: true
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 99,
          features: ['Unlimited properties', 'Custom integrations', '24/7 support', 'White-label'],
          popular: false
        }
      ]
    }
  });
});

// Dashboard landing stats
app.get('/api/dashboard/landing-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: 1250,
      totalTenants: 3400,
      totalRevenue: 2500000,
      activeUsers: 850,
      monthlyRevenue: 125000,
      occupancyRate: 94.2,
      maintenanceRequests: 23,
      overduePayments: 8
    }
  });
});

// Debug endpoint to check user data (remove in production)
app.get('/api/debug/user/:email', async (req, res) => {
  try {
    if (!isDBConnected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }
    
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        passwordLength: user.password ? user.password.length : 0,
        passwordStart: user.password ? user.password.substring(0, 10) : 'N/A',
        isHashed: user.password && (user.password.startsWith('$2') || user.password.length === 64 || user.password.length === 32),
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Additional endpoints
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      apiVersion: '1.0.0',
      features: ['auth', 'properties', 'tenants', 'payments'],
      environment: process.env.NODE_ENV || 'development',
      database: isDBConnected ? 'Connected' : 'Disconnected'
    }
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
      '/api/dashboard/landing-stats',
      '/api/plans/public',
      '/api/site-settings/public',
      '/api/debug/user/:email',
      '/api/auth/login',
      '/api/auth/register'
    ],
    timestamp: new Date().toISOString()
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
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      isDBConnected = true;
    } else {
      console.log('⚠️ MongoDB URI not provided - running without database');
      isDBConnected = false;
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    isDBConnected = false;
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  
  const server = createServer(app);
  
  server.listen(PORT, '0.0.0.0', () => {
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://hnv.onrender.com' : `http://localhost:${PORT}`;
    console.log('🚀 HNV Property Management Backend');
    console.log('=====================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Database: ${isDBConnected ? 'Connected' : 'Disconnected'}`);
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