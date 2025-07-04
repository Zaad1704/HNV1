import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Reminder from '../models/Reminder';
import AuditLog from '../models/AuditLog';
import Notification from '../models/Notification';
import Property from '../models/Property';
import notificationService from './notificationService';

class ActionChainService {
  // When payment is recorded
  async onPaymentRecorded(paymentData: any, userId: string, organizationId: string) {
    try {
      // 1. Update tenant status if late payment
      await this.updateTenantStatus(paymentData.tenantId, organizationId);
      
      // 2. Cancel overdue reminders
      await this.cancelOverdueReminders(paymentData.tenantId, paymentData.paymentDate);
      
      // 3. Update property cash flow
      await this.updatePropertyCashFlow(paymentData.propertyId, paymentData.amount, 'income');
      
      // 4. Create audit log
      await this.createAuditLog({
        userId,
        organizationId,
        action: 'payment_recorded',
        resource: 'payment',
        resourceId: paymentData._id,
        details: { amount: paymentData.amount, tenant: paymentData.tenantId }
      });
      
      // 5. Send notification to landlord
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
  private async updateTenantStatus(tenantId: string, organizationId: string) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return;

    const recentPayment = await Payment.findOne({
      tenantId,
      paymentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    tenant.status = recentPayment ? 'Active' : 'Late';
    await tenant.save();
  }

  private async cancelOverdueReminders(tenantId: string, paymentDate: Date) {
    await Reminder.updateMany(
      {
        tenantId,
        type: 'rent_reminder',
        status: 'active',
        nextRunDate: { $lte: paymentDate }
      },
      { status: 'completed' }
    );
  }

  private async updatePropertyCashFlow(propertyId: string, amount: number, type: 'income' | 'expense') {
    // Update property cash flow tracking
    const property = await Property.findById(propertyId);
    if (property) {
      if (!property.cashFlow) property.cashFlow = { income: 0, expenses: 0 };
      property.cashFlow[type] += amount;
      await property.save();
    }
  }

  private async updatePropertyOccupancy(propertyId: string) {
    const property = await Property.findById(propertyId);
    if (!property) return;

    const occupiedUnits = await Tenant.countDocuments({
      propertyId,
      status: { $in: ['Active', 'Late'] }
    });

    property.occupancyRate = (occupiedUnits / property.numberOfUnits) * 100;
    await property.save();
  }

  private async createRentReminder(tenantData: any, organizationId: string) {
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
  }

  private async createApprovalRequest(maintenanceData: any, userId: string, organizationId: string) {
    // Create approval request logic
    await this.createNotification({
      userId,
      organizationId,
      type: 'warning',
      title: 'Approval Required',
      message: `Maintenance request requires approval: $${maintenanceData.estimatedCost}`,
      link: `/dashboard/approvals`
    });
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

  private async createAuditLog(data: any) {
    await AuditLog.create({
      ...data,
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      timestamp: new Date()
    });
  }

  private async createNotification(data: any) {
    await Notification.create(data);
  }
}

export default new ActionChainService();