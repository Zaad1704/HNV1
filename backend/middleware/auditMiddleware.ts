import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

interface AuthRequest extends Request {
  user?: any;
}

export const auditLog = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Don't await to avoid blocking response
        createAuditLog(req, action, resource, data).catch(console.error);
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};

async function createAuditLog(req: AuthRequest, action: string, resource: string, responseData: any) {
  try {
    if (!req.user) return;

    const resourceId = req.params.id || 
                      (responseData && typeof responseData === 'string' ? 
                       JSON.parse(responseData)?.data?._id : null) ||
                      'unknown';

    await AuditLog.create({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      action,
      resource,
      resourceId,
      details: {
        method: req.method,
        url: req.originalUrl,
        body: req.method !== 'GET' ? req.body : undefined,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }
}

export default auditLog;