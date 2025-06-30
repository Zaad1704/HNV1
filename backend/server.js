const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const app = express();

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI || process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
      console.log('MongoDB Connected...');
    }
  } catch (err) {
    console.error(err.message);
  }
};
connectDB();

const allowedOrigins = ['https://www.hnvpm.com', 'https://hnvpm.com', 'https://hnv.onrender.com'];
if (process.env.CORS_ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.CORS_ALLOWED_ORIGINS.split(','));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
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

app.get('/api/dashboard/landing-stats', (req, res) => {
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
      { id: 1, name: 'Basic', price: 29, features: ['5 Properties'] },
      { id: 2, name: 'Pro', price: 79, features: ['25 Properties'] },
      { id: 3, name: 'Enterprise', price: 199, features: ['Unlimited'] }
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));