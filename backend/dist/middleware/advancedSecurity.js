"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.validateApiSignature = exports.ipSecurity = exports.sessionManager = exports.blacklistToken = exports.advancedAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../services/logger");
const tokenBlacklist = new Set();
const advancedAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ success: false, message: 'Token has been revoked.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
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
const blacklistToken = (token) => {
    tokenBlacklist.add(token);
};
exports.blacklistToken = blacklistToken;
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
        session.lastActivity = new Date();
        return true;
    },
    destroySession: (sessionId) => {
        exports.sessionManager.activeSessions.delete(sessionId);
    },
    cleanExpiredSessions: () => {
        const now = new Date();
        const maxAge = 24 * 60 * 60 * 1000;
        for (const [sessionId, session] of exports.sessionManager.activeSessions) {
            if (now.getTime() - session.lastActivity.getTime() > maxAge) {
                exports.sessionManager.activeSessions.delete(sessionId);
            }
        }
    }
};
const ipSecurity = (req, res, next) => {
    const clientIp = req.ip || '';
    const suspiciousIps = new Set(['127.0.0.1']);
    if (suspiciousIps.has(clientIp)) {
        logger_1.logger.warn(`Blocked request from suspicious IP: ${clientIp}`);
        return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    next();
};
exports.ipSecurity = ipSecurity;
const validateApiSignature = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    const signature = req.header('X-Signature');
    const timestamp = req.header('X-Timestamp');
    if (!apiKey || !signature || !timestamp) {
        return next();
    }
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 300000) {
        return res.status(401).json({ success: false, message: 'Request timestamp expired.' });
    }
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
setInterval(exports.sessionManager.cleanExpiredSessions, 60 * 60 * 1000);
