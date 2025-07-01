const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: '1', name: 'Admin User', email: 'alhaz.halim@gmail.com', role: 'SuperAdmin' },
      token: 'jwt_' + Date.now()
    }
  });
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/api/status', (req, res) => res.json({ success: true }));
app.get('/api/public', (req, res) => res.json({ success: true, data: {} }));
app.get('/api/landing-stats', (req, res) => res.json({ success: true, data: {} }));
app.get('/api/site-settings/public', (req, res) => res.json({ success: true, data: {} }));

// Google OAuth
app.get('/api/auth/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=dummy&redirect_uri=https://hnv.onrender.com/api/auth/google/callback&response_type=code&scope=email profile`;
  res.redirect(googleAuthUrl);
});

app.get('/api/auth/google/callback', (req, res) => {
  res.redirect('https://hnvpm.com/login?success=true');
});

// Missing endpoints
app.get('/api/dashboard/landing-stats', (req, res) => res.json({ success: true, data: {} }));
app.get('/api/plans/public', (req, res) => res.json({ success: true, data: [] }));
app.post('/api/auth/forgot-password', (req, res) => res.json({ success: true, message: 'Reset link sent' }));
app.post('/api/auth/register', (req, res) => res.json({ success: true, message: 'Registration successful' }));

app.listen(PORT, () => console.log('Server started'));