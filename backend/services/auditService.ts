import AuditLog from '../models/AuditLog';

interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  details?: any;
}

export const logAudit = async (data: AuditLogData) => {
  try {
    const auditLog = new AuditLog({
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      details: data.details,
      timestamp: new Date()
    });
    
    await auditLog.save();
    console.log('Audit log created successfully');
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export default {
  logAudit
};
