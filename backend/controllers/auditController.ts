import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';

interface AuthRequest extends Request {
  user?: any;
}

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const logs = await AuditLog.find({ organizationId: req.user.organizationId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: logs || [] });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(200).json({ success: true, data: [] });
  }
};

export const createAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const { action, resource, details } = req.body;

    const auditLog = await AuditLog.create({
      userId: req.user._id,
      organizationId: req.user.organizationId,
      action,
      resource,
      details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({ success: true, data: auditLog });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};