import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Reminder from '../models/Reminder';
import AuditLog from '../models/AuditLog';
import Notification from '../models/Notification';
import Property from '../models/Property';
import MaintenanceRequest from '../models/MaintenanceRequest';
import notificationService from './notificationService';
import mongoose from 'mongoose';

class ActionChainService {
  // When payment is recorded
  async onPaymentRecorded(paymentData: any, userId: string, organizationId: string) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. Update tenant status if late payment
        await this.updateTenantStatus(paymentData.tenantId, organizationId, session);
        
        // 2. Cancel overdue reminders
        await this.cancelOverdueReminders(paymentData.tenantId, paymentData.paymentDate, session);
        
        // 3. Update property cash flow
        await this.updatePropertyCashFlow(paymentData.propertyId, paymentData.amount, 'income', session);
        
        // 4. Create audit log
        await this.createAuditLog({
          userId,
          organizationId,
          action: 'payment_recorded',
          resource: 'payment',
          resourceId: paymentData._id,
          details: { amount: paymentData.amount, tenant: paymentData.tenantId }
        }, session);
      });
      
      // 5. Send notification (outside transaction)
      const tenant = await Tenant.findById(paymentData.tenantId);
      if (tenant) {
        await notificationService.notifyPaymentReceived(
          tenant.name, 
          paymentData.amount, 
          userId, 
          organizationId
        );
      }
      
    } catch (error) {
      console.error('Payment chain action error:', error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  // When tenant is added
  async onTenantAdded(tenantData: any, userId: string, organizationId: string) {
    try {
      // 1. Update property occupancy
      await this.updatePropertyOccupancy(tenantData.propertyId);
      
      // 2. Create welcome notification
      await this.createNotification({
        userId,
        organizationId,
        type: 'info',
        title: 'New Tenant Added',
        message: `${tenantData.name} has been added to your property`,
        link: `/dashboard/tenants/${tenantData._id}`
      });
      
      // 3. Create rent reminder
      await this.createRentReminder(tenantData, organizationId);
      
      // 4. Audit log
      await this.createAuditLog({
        userId,
        organizationId,
        action: 'tenant_added',
        resource: 'tenant',
        resourceId: tenantData._id,
        details: { name: tenantData.name, unit: tenantData.unit }
      });
      
    } catch (error) {
      console.error('Tenant added chain action error:', error);
    }
  }

  // When property is added
  async onPropertyAdded(propertyData: any, userId: string, organizationId: string) {
    try {
      // 1. Initialize cash flow tracking
      await this.initializePropertyCashFlow(propertyData._id);
      
      // 2. Create notification
      await this.createNotification({
        userId,
        organizationId,
        type: 'success',
        title: 'Property Added',
        message: `${propertyData.name} has been added to your portfolio`,
        link: `/dashboard/properties/${propertyData._id}`
      });
      
      // 3. Audit log
      await this.createAuditLog({
        userId,
        organizationId,
        action: 'property_added',
        resource: 'property',
        resourceId: propertyData._id,
        details: { name: propertyData.name, units: propertyData.numberOfUnits }
      });
      
    } catch (error) {
      console.error('Property added chain action error:', error);
    }
  }

  // When maintenance request is created
  async onMaintenanceCreated(maintenanceData: any, userId: string, organizationId: string) {
    try {
      // 1. Create approval if cost > threshold
      if (maintenanceData.estimatedCost > 500) {
        await this.createApprovalRequest(maintenanceData, userId, organizationId);
      }
      
      // 2. Notify property manager
      await this.createNotification({
        userId,
        organizationId,
        type: 'warning',
        title: 'Maintenance Request',
        message: `New maintenance request: ${maintenanceData.description}`,
        link: `/dashboard/maintenance/${maintenanceData._id}`
      });
      
      // 3. Update property status if urgent
      if (maintenanceData.priority === 'urgent') {
        await this.updatePropertyMaintenanceStatus(maintenanceData.propertyId, 'urgent_maintenance');
      }
      
    } catch (error) {
      console.error('Maintenance chain action error:', error);
    }
  }

  // Helper methods
  private async updateTenantStatus(tenantId: string, organizationId: string, session?: any) {
    try {
      const tenant = await Tenant.findById(tenantId).session(session);
      if (!tenant) return;

      const recentPayment = await Payment.findOne({
        tenantId,
        status: { $in: ['Paid', 'completed', 'Completed'] },
        paymentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).session(session);

      tenant.status = recentPayment ? 'Active' : 'Late';
      await tenant.save({ session });
    } catch (error) {
      console.error('Update tenant status error:', error);
      throw error;
    }
  }

  private async cancelOverdueReminders(tenantId: string, paymentDate: Date, session?: any) {
    await Reminder.updateMany(
      {
        tenantId,
        type: 'rent_reminder',
        status: 'active',
        nextRunDate: { $lte: paymentDate }
      },
      { status: 'completed' },
      { session }
    );
  }

  private async updatePropertyCashFlow(propertyId: string, amount: number, type: 'income' | 'expense', session?: any) {
    try {
      const property = await Property.findById(propertyId).session(session);
      if (property) {
        if (!property.cashFlow) property.cashFlow = { income: 0, expenses: 0 };
        property.cashFlow[type] += (amount || 0);
        await property.save({ session });
      }
    } catch (error) {
      console.error('Update property cash flow error:', error);
      throw error;
    }
  }

  private async updatePropertyOccupancy(propertyId: string) {
    try {
      const property = await Property.findById(propertyId);
      if (!property) return;

      const occupiedUnits = await Tenant.countDocuments({
        propertyId,
        status: { $in: ['Active', 'Late'] }
      });

      property.occupancyRate = Math.round((occupiedUnits / (property.numberOfUnits || 1)) * 100);
      await property.save();
    } catch (error) {
      console.error('Update property occupancy error:', error);
    }
  }

  private async createRentReminder(tenantData: any, organizationId: string) {
    try {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);

      await Reminder.create({
        organizationId,
        tenantId: tenantData._id,
        propertyId: tenantData.propertyId,
        type: 'rent_reminder',
        message: `Rent payment due for Unit ${tenantData.unit}`,
        nextRunDate: nextMonth,
        frequency: 'monthly',
        status: 'active'
      });
    } catch (error) {
      console.error('Create rent reminder error:', error);
    }
  }

  private async createApprovalRequest(maintenanceData: any, userId: string, organizationId: string) {
    try {
      // Create approval request logic
      await this.createNotification({
        userId,
        organizationId,
        type: 'warning',
        title: 'Approval Required',
        message: `Maintenance request requires approval: $${maintenanceData.estimatedCost || 0}`,
        actionUrl: `/dashboard/approvals`
      });
    } catch (error) {
      console.error('Create approval request error:', error);
    }
  }

  private async updatePropertyMaintenanceStatus(propertyId: string, status: string) {
    await Property.findByIdAndUpdate(propertyId, { maintenanceStatus: status });
  }

  private async initializePropertyCashFlow(propertyId: string) {
    await Property.findByIdAndUpdate(propertyId, {
      cashFlow: { income: 0, expenses: 0 },
      occupancyRate: 0
    });
  }

  private async createAuditLog(data: any, session?: any) {
    try {
      const auditData = {
        ...data,
        ipAddress: data.ipAddress || '127.0.0.1',
        userAgent: data.userAgent || 'System',
        timestamp: new Date()
      };
      
      if (session) {
        await AuditLog.create([auditData], { session });
      } else {
        await AuditLog.create(auditData);
      }
    } catch (error) {
      console.error('Create audit log error:', error);
    }
  }

  private async createNotification(data: any) {
    try {
      await Notification.create({
        ...data,
        organizationId: data.organizationId || null
      });
    } catch (error) {
      console.error('Create notification error:', error);
    }
  }
}

export default new ActionChainService();