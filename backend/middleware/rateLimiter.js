"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserLimiter = exports.speedLimiter = exports.uploadLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
// General API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Strict rate limiter for auth endpoints
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: 15 * 60
    },
    skipSuccessfulRequests: true,
});
// Password reset limiter
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.',
        retryAfter: 60 * 60
    },
});
// File upload limiter
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 uploads per windowMs
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.',
        retryAfter: 15 * 60
    },
});
// Speed limiter for heavy operations
exports.speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per windowMs without delay
    delayMs: 500, // add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // maximum delay of 20 seconds
});
// User-specific rate limiter (requires authentication)
const createUserLimiter = (maxRequests = 1000) => {
    const userLimits = new Map();
    return (req, res, next) => {
        const userId = req.user?.id;
        if (!userId)
            return next();
        const now = Date.now();
        const windowMs = 60 * 60 * 1000; // 1 hour
        const userLimit = userLimits.get(userId);
        if (!userLimit || now > userLimit.resetTime) {
            userLimits.set(userId, { count: 1, resetTime: now + windowMs });
            return next();

        if (userLimit.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'User rate limit exceeded',
                retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
            });

        userLimit.count++;
        next();
    };
};
exports.createUserLimiter = createUserLimiter;
//# sourceMappingURL=rateLimiter.js.map