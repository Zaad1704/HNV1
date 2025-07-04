import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
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
export const authLimiter = rateLimit({
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
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: 60 * 60
  },
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    retryAfter: 15 * 60
  },
});

// Speed limiter for heavy operations
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// User-specific rate limiter (requires authentication)
export const createUserLimiter = (maxRequests: number = 1000) => {
  const userLimits = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: Function) => {
    const userId = (req as any).user?.id;
    if (!userId) return next();

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