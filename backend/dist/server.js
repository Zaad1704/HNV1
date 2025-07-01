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

app.listen(PORT, () => console.log('Server started'));