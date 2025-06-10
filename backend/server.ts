const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// --- Import API Route Files ---
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const propertiesRoutes = require('./routes/propertiesRoutes');
const tenantsRoutes = require('./routes/tenantsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionsRoutes = require('./routes/subscriptionsRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// --- Connect to Database ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

// --- Core Middleware ---

// ** CORS CONFIGURATION **
// This is the most important part for connecting the frontend and backend.
const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://hnv-1-frontend.onrender.com' // Your live frontend URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};
app.use(cors(corsOptions));


app.use(express.json());


// --- Mount API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/audit', auditRoutes);


// A simple health-check route
app.get('/api', (req, res) => {
  res.send('HNV SaaS API is running successfully!');
});


// --- Start Server ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
