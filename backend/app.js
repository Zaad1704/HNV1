const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { healthCheckHandler } = require('./healthCheck');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*', credentials: true }));

app.get('/healthz', healthCheckHandler);

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

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: false,
    message: 'Authentication service temporarily unavailable'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'HNV API is running!' });
});

module.exports = app;