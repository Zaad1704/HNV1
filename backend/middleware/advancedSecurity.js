"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.validateApiSignature = exports.ipSecurity = exports.sessionManager = exports.blacklistToken = exports.advancedAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../services/logger");
// Enhanced JWT middleware with blacklist support
const tokenBlacklist = new Set();
const advancedAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }
        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ success: false, message: 'Token has been revoked.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // Log access for audit
        logger_1.logger.info(`User ${decoded.id} accessed ${req.method} ${req.path}`, {
            userId: decoded.id,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    }
    catch (error) {
        logger_1.logger.warn(`Invalid token attempt from ${req.ip}`, { error: error.message });
        res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};
exports.advancedAuth = advancedAuth;
// Token blacklist management
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
    // In production, use Redis for distributed blacklist
};
exports.blacklistToken = blacklistToken;
// Session management
exports.sessionManager = {
    activeSessions: new Map(),
    createSession: (userId, ip) => {
        const sessionId = crypto_1.default.randomUUID();
        exports.sessionManager.activeSessions.set(sessionId, {
            userId,
            lastActivity: new Date(),
            ip
        });
        return sessionId;
    },
    validateSession: (sessionId, ip) => {
        const session = exports.sessionManager.activeSessions.get(sessionId);
        if (!session || session.ip !== ip)
            return false;
        // Update last activity
        session.lastActivity = new Date();
        return true;
    },
    destroySession: (sessionId) => {
        exports.sessionManager.activeSessions.delete(sessionId);
    },
    // Clean expired sessions (run periodically)
    cleanExpiredSessions: () => {
        const now = new Date();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        for (const [sessionId, session] of exports.sessionManager.activeSessions) {
            if (now.getTime() - session.lastActivity.getTime() > maxAge) {
                exports.sessionManager.activeSessions.delete(sessionId);
            }
        }
    }
};
// IP-based security
const ipSecurity = (req, res, next) => {
    const clientIp = req.ip;
    const suspiciousIps = new Set(['127.0.0.1']); // Add known malicious IPs
    if (suspiciousIps.has(clientIp)) {
        logger_1.logger.warn(`Blocked request from suspicious IP: ${clientIp}`);
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
};
exports.ipSecurity = ipSecurity;
// Request signature validation for API keys
const validateApiSignature = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    const signature = req.header('X-Signature');
    const timestamp = req.header('X-Timestamp');
    if (!apiKey || !signature || !timestamp) {
        return next(); // Skip if not API request
    }
    // Validate timestamp (prevent replay attacks)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 300000) { // 5 minutes
        return res.status(401).json({ success: false, message: 'Request timestamp expired.' });
    }
    // Validate signature
    const payload = JSON.stringify(req.body) + timestamp;
    const expectedSignature = crypto_1.default
        .createHmac('sha256', process.env.API_SECRET)
        .update(payload)
        .digest('hex');
    if (signature !== expectedSignature) {
        return res.status(401).json({ success: false, message: 'Invalid signature.' });
    }
    next();
};
exports.validateApiSignature = validateApiSignature;
// Audit logging middleware
const auditLogger = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        };
        if (res.statusCode >= 400) {
            logger_1.logger.warn('Request failed', logData);
        }
        else {
            logger_1.logger.info('Request completed', logData);
        }
    });
    next();
};
exports.auditLogger = auditLogger;
// Clean up expired sessions every hour
setInterval(exports.sessionManager.cleanExpiredSessions, 60 * 60 * 1000);
//# sourceMappingURL=advancedSecurity.js.map