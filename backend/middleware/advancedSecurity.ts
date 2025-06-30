import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../services/logger';

// Enhanced JWT middleware with blacklist support
const tokenBlacklist = new Set<string>();

export const advancedAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ success: false, message: 'Token has been revoked.' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    
    // Log access for audit
    logger.info(`User ${decoded.id} accessed ${req.method} ${req.path}`, {
      userId: decoded.id,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  } catch (error) {
    logger.warn(`Invalid token attempt from ${req.ip}`, { error: (error as Error).message });
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Token blacklist management
export const blacklistToken = (token: string) => {
  tokenBlacklist.add(token);
  // In production, use Redis for distributed blacklist
};

// Session management
export const sessionManager = {
  activeSessions: new Map<string, { userId: string, lastActivity: Date, ip: string }>(),
  
  createSession: (userId: string, ip: string) => {
    const sessionId = crypto.randomUUID();
    sessionManager.activeSessions.set(sessionId, {
      userId,
      lastActivity: new Date(),
      ip
    });
    return sessionId;
  },
  
  validateSession: (sessionId: string, ip: string) => {
    const session = sessionManager.activeSessions.get(sessionId);
    if (!session || session.ip !== ip) return false;
    
    // Update last activity
    session.lastActivity = new Date();
    return true;
  },
  
  destroySession: (sessionId: string) => {
    sessionManager.activeSessions.delete(sessionId);
  },
  
  // Clean expired sessions (run periodically)
  cleanExpiredSessions: () => {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [sessionId, session] of sessionManager.activeSessions) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        sessionManager.activeSessions.delete(sessionId);
      }
    }
  }
};

// IP-based security
export const ipSecurity = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || '';
  const suspiciousIps = new Set(['127.0.0.1']); // Add known malicious IPs
  
  if (suspiciousIps.has(clientIp)) {
    logger.warn(`Blocked request from suspicious IP: ${clientIp}`);
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  
  next();
};

// Request signature validation for API keys
export const validateApiSignature = (req: Request, res: Response, next: NextFunction) => {
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
  const expectedSignature = crypto
    .createHmac('sha256', process.env.API_SECRET!)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ success: false, message: 'Invalid signature.' });
  }
  
  next();
};

// Audit logging middleware
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
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
      logger.warn('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};

// Clean up expired sessions every hour
setInterval(sessionManager.cleanExpiredSessions, 60 * 60 * 1000);