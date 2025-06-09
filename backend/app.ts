// backend/app.ts

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import your route files
import authRoutes from './routes/authRoutes';
import invitationRoutes from './routes/invitationRoutes';
// Add other route imports here...
// import orgRoutes from './routes/orgRoutes';
// import adminRoutes from './routes/adminRoutes';

// Create the Express app instance
const app: Express = express();

// --- Middleware Setup ---
// Enable CORS for all requests
app.use(cors());
// Set various security headers
app.use(helmet());
// Parse JSON bodies
app.use(express.json());

// --- Route Setup ---
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
// Add other routes here...
// app.use('/api/orgs', orgRoutes);
// app.use('/api/admin', adminRoutes);

// Export the configured app
export { app };
