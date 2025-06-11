// FILE: backend/services/auditService.ts
import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose';

class AuditService {
  async recordAction(userId: mongoose.Types.ObjectId, organizationId: mongoose.Types.ObjectId, action: string, details: object = {}) {
    try {
      await AuditLog.create({
        user: userId,
        organizationId,
        action,
        details,
      });
    } catch (error) {
      console.error('Failed to record audit log:', error);
    }
  }
}

export default new AuditService();
