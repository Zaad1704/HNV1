const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Direct route definitions to avoid import issues
app.get('/api/site-settings', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      logoUrl: '/logo-min.png',
      theme: 'light',
      language: 'en',
      primaryColor: '#3B82F6'
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

app.get('/api/plans/public', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Basic', price: 29, features: ['5 Properties', 'Basic Support'] },
      { id: 2, name: 'Pro', price: 79, features: ['25 Properties', 'Priority Support'] },
      { id: 3, name: 'Enterprise', price: 199, features: ['Unlimited Properties', '24/7 Support'] }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'HNV API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});