const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// API endpoints - defined first
app.get('/api/site-settings', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      logoUrl: '/logo-min.png',
      theme: 'light',
      language: 'en'
    }
  });
});

app.get('/api/landing-stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProperties: 1250,
      totalTenants: 3400,
      totalRevenue: 2850000,
      satisfactionRate: 98
    }
  });
});

app.get('/api/public', (req, res) => {
  res.json({
    success: true,
    data: {
      appName: 'HNV Property Management',
      version: '1.0.0',
      status: 'operational'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Authentication service temporarily unavailable'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'HNV API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});