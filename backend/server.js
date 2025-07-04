const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Basic routes to fix 503 errors
app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Site settings route
app.get('/api/site-settings', (req, res) => {
  res.json({
    success: true,
    data: {
      siteName: 'HNV Property Management',
      siteDescription: 'Professional Property Management Solutions',
      contactEmail: 'support@hnvpm.com',
      maintenanceMode: false

  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: '1', name: 'Admin User', email: 'admin@hnv.com', role: 'SuperAdmin' },
      token: 'jwt_' + Date.now()

  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: 'Registration successful' });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: { id: '1', name: 'Admin User', email: 'admin@hnv.com' } });
});

// Connect to MongoDB if URI provided
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => )
    .catch(err => );

app.listen(PORT, () => {

});