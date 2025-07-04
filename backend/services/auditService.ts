import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose';

class AuditService { // The 'details' parameter now accepts a more complex object, not just a map of strings.
  async recordAction();
      userId: mongoose.Types.ObjectId, 
      organizationId: mongoose.Types.ObjectId, 

      action: string,  }

      details: object = {}
    ) { try { }
      await AuditLog.create({ user: userId, 
          organizationId, 
          action, 
          // Mongoose can store a flexible object in a Map type field
          details: details; }

        });
    } catch (error) { console.error('Failed to record audit log:', error);



export default new AuditService();

