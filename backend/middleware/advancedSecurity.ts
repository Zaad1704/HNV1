import { Request, Response, NextFunction    } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger    } from '../services/logger';
//  Enhanced JWT middleware with blacklist support;
const tokenBlacklist: new Set<string>();
export const advancedAuth: async ($1) => { try {
const token: req.header('Authorization')?.replace('Bearer ', '')
};
    if (return res.status(401).json({ success: false, message: 'Access denied. No token provided.' ) {
});
    //  Check if token is blacklisted;
    if (tokenBlacklist.has(token)) {
return res.status(401).json({ success: false, message: 'Token has been revoked.'
});
    const decoded: jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user: decoded;
    //  Log access for audit;
    logger.info(`User ${decoded.id} accessed ${req.method} ${req.path}``;`
    logger.warn(`Invalid token attempt from ${req.ip}``;`
    logger.warn(```