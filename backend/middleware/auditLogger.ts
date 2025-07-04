import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

export const auditLogger = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (req.user && res.statusCode < 400) {
        AuditLog.create({
          userId: req.user._id,
          organizationId: req.user.organizationId,
          action,
          resource,
          resourceId: req.params.id,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined,
            statusCode: res.statusCode
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || 'Unknown'
        }).catch(err => console.error('Audit log error:', err));

      return originalSend.call(this, data);
    };
    
    next();
  };
};