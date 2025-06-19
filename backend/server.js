const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Route imports
const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const propertiesRoutes = require('./routes/propertiesRoutes');
const tenantsRoutes = require('./routes/tenantsRoutes');
const paymentsRoutes = require('./routes/paymentsRoutes');
const userRoutes = require('./routes/userRoutes');
const auditRoutes = require('./routes/auditRoutes');
const setupRoutes = require('./routes/setupRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const planRoutes = require('./routes/planRoutes');
const billingRoutes = require('./routes/billingRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const translationRoutes = require('./routes/translationRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const sharingRoutes = require('./routes/sharingRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');

dotenv.config();

const app = express();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message || 'An unknown error occurred during database connection.');
    process.exit(1);
  }
};
connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'https://hnv-1-frontend.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount All API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/share', sharingRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/maintenance', maintenanceRoutes);

app.get('/', (req, res) => {
  res.send('HNV SaaS API is running successfully!');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;
