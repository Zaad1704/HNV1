"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.ipWhitelist = exports.nameValidation = exports.passwordValidation = exports.emailValidation = exports.handleValidationErrors = exports.sanitizeInput = exports.speedLimiter = exports.createRateLimit = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const express_validator_1 = require("express-validator");
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
            connectSrc: ["'self'", "https://api.stripe.com", "wss:", "ws:"],
            frameSrc: ["'self'", "https://js.stripe.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});
const createRateLimit = (windowMs, max, message) => (0, express_rate_limit_1.default)({
    windowMs,
    max,
    message: message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Rate limit exceeded',
            retryAfter: Math.round(windowMs / 1000)
        });
    }
});
exports.createRateLimit = createRateLimit;
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 500,
    maxDelayMs: 20000,
});
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);
    next();
};
exports.sanitizeInput = sanitizeInput;
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.emailValidation = (0, express_validator_1.body)('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address');
exports.passwordValidation = (0, express_validator_1.body)('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
exports.nameValidation = (0, express_validator_1.body)('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces');
const ipWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (process.env.NODE_ENV === 'development') {
            return next();
        }
        if (allowedIPs.includes(clientIP)) {
            next();
        }
        else {
            res.status(403).json({
                success: false,
                message: 'Access denied from this IP address'
            });
        }
    };
};
exports.ipWhitelist = ipWhitelist;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        if (process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(logData));
        }
        else {
            console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
exports.default = {
    securityHeaders: exports.securityHeaders,
    createRateLimit: exports.createRateLimit,
    speedLimiter: exports.speedLimiter,
    sanitizeInput: exports.sanitizeInput,
    handleValidationErrors: exports.handleValidationErrors,
    emailValidation: exports.emailValidation,
    passwordValidation: exports.passwordValidation,
    nameValidation: exports.nameValidation,
    ipWhitelist: exports.ipWhitelist,
    requestLogger: exports.requestLogger
};
