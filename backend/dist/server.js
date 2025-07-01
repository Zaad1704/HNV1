const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5001;

// Simple CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User model
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'Landlord' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const sessions = new Map();
let isDBConnected = false;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('✅ MongoDB Connected');
    isDBConnected = true;
  })
  .catch(err => {
    console.log('❌ MongoDB Error:', err.message);
    isDBConnected = false;
  });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: isDBConnected ? 'Connected' : 'Disconnected' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: isDBConnected ? 'Connected' : 'Disconnected' });
});

app.get('/api/status', (req, res) => {
  res.json({ success: true, message: 'API operational', database: isDBConnected ? 'Connected' : 'Disconnected' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    if (!isDBConnected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    let passwordMatch = false;
    if (user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = user.password === password;
    }
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = 'jwt_' + Buffer.from(JSON.stringify({ id: user._id, email: user.email })).toString('base64');
    sessions.set(token, user);
    
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
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Landlord' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }
    
    if (!isDBConnected) {
      return res.status(503).json({ success: false, message: 'Database not available' });
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
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Other endpoints
app.get('/api/public', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      companyName: 'HNV Solutions',
      features: { propertyManagement: true, tenantPortal: true }
    }
  });
});

app.get('/api/landing-stats', (req, res) => {
  res.json({
    success: true,
    data: { totalProperties: 1250, totalTenants: 3400, totalRevenue: 2500000, activeUsers: 850 }
  });
});

app.get('/api/site-settings/public', (req, res) => {
  res.json({
    success: true,
    data: { siteName: 'HNV Property Management', logo: '/logo-min.png', theme: 'default' }
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health: https://hnv.onrender.com/health`);
});