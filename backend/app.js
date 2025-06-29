"use strict";
// backend/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const securityMiddleware_1 = require("./middleware/securityMiddleware");
// Import your route files
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const invitationRoutes_1 = __importDefault(require("./routes/invitationRoutes"));
// Add other route imports here...
// import orgRoutes from './routes/orgRoutes';
// import adminRoutes from './routes/adminRoutes';
// Create the Express app instance
const app = (0, express_1.default)();
exports.app = app;
// --- Security Middleware Setup ---
// Enhanced security headers
app.use(securityMiddleware_1.securityHeaders);
// Configured CORS
app.use(securityMiddleware_1.corsConfig);
// Rate limiting
app.use((0, securityMiddleware_1.createRateLimit)(15 * 60 * 1000, 100));
// Prevent NoSQL injection
app.use((0, express_mongo_sanitize_1.default)());
// Prevent HTTP Parameter Pollution
app.use((0, hpp_1.default)());
// Parse JSON bodies with size limit
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Input sanitization
app.use(securityMiddleware_1.sanitizeInput);
// Request logging
app.use(securityMiddleware_1.requestLogger);
// --- Route Setup ---
app.use('/api/auth', authRoutes_1.default);
app.use('/api/invitations', invitationRoutes_1.default);
//# sourceMappingURL=app.js.map