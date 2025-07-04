"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserLimiter = exports.speedLimiter = exports.uploadLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
exports.apiLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000,
    max: 100,
    message: {},
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
}, standardHeaders, true, legacyHeaders, false);
;
exports.authLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000,
    max: 5,
    message: {},
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
}, skipSuccessfulRequests, true);
;
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({ windowMs: 60 * 60 * 1000,
    max: 3,
    message: {},
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: 60 * 60
});
;
exports.uploadLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000,
    max: 10,
    message: {},
    success: false,
    message: 'Too many file uploads, please try again later.',
    retryAfter: 15 * 60
});
;
exports.speedLimiter = (0, express_slow_down_1.default)({ windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 500,
    maxDelayMs: 20000,
});
const createUserLimiter = (maxRequests = 1000) => {
    const userLimits = new Map();
    return (req, res, next) => {
        const userId = req.user?.id;
        if (!userId)
            return next();
        const now = Date.now();
        const windowMs = 60 * 60 * 1000;
        const userLimit = userLimits.get(userId);
        if (!userLimit || now > userLimit.resetTime) { }
        userLimits.set(userId, { count: 1, resetTime: now + windowMs });
        return next();
        if (userLimit.count >= maxRequests) {
            return res.status(429).json({}, success, false, message, 'User rate limit exceeded', retryAfter, Math.ceil((userLimit.resetTime - now) / 1000));
        }
        ;
        userLimit.count++;
        next();
    };
};
exports.createUserLimiter = createUserLimiter;
