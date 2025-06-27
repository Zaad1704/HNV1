// backend/app.ts

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { securityHeaders, corsConfig, createRateLimit, sanitizeInput, requestLogger } from './middleware/securityMiddleware';

// Import your route files
import authRoutes from './routes/authRoutes';
import invitationRoutes from './routes/invitationRoutes';
// Add other route imports here...
// import orgRoutes from './routes/orgRoutes';
// import adminRoutes from './routes/adminRoutes';

// Create the Express app instance
const app: Express = express();

// --- Security Middleware Setup ---
// Enhanced security headers
app.use(securityHeaders);
// Configured CORS
app.use(corsConfig);
// Rate limiting
app.use(createRateLimit(15 * 60 * 1000, 100));
// Prevent NoSQL injection
app.use(mongoSanitize());
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Parse JSON bodies with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Input sanitization
app.use(sanitizeInput);
// Request logging
app.use(requestLogger);

// --- Route Setup ---
app.use('/api/auth', authRoutes);
app.use('/api/invitations', invitationRoutes);
// Add other routes here...
// app.use('/api/orgs', orgRoutes);
// app.use('/api/admin', adminRoutes);

// Export the configured app
export { app };
