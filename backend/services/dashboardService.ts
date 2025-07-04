import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Reminder from '../models/Reminder';

class DashboardService {
  async getDashboardStats(organizationId: string) {
    try {
      // Get real-time stats
      const [properties, tenants, payments, reminders] = await Promise.all([
        Property.find({ organizationId }),
        Tenant.find({ organizationId }),
        Payment.find({ organizationId }).sort({ paymentDate: -1 }).limit(10),
        Reminder.find({ organizationId, status: 'active' })
      ]);

      // Calculate occupancy rate
      const totalUnits = properties.reduce((sum, prop) => sum + prop.numberOfUnits, 0);
      const occupiedUnits = tenants.filter(t => ['Active', 'Late'].includes(t.status)).length;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      // Calculate monthly revenue
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const monthlyPayments = payments.filter(p => 
        new Date(p.paymentDate) >= currentMonth
      );
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

      // Count pending maintenance
      const pendingMaintenance = reminders.filter(r => 
        r.type === 'maintenance_reminder'
      ).length;

      // Recent payments count
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentPayments = payments.filter(p => 
        new Date(p.paymentDate) >= last24Hours
      ).length;

      return {
        totalProperties: properties.length,
        totalTenants: tenants.length,
        monthlyRevenue,
        occupancyRate,
        pendingMaintenance,
        recentPayments
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        totalProperties: 0,
        totalTenants: 0,
        monthlyRevenue: 0,
        occupancyRate: 0,
        pendingMaintenance: 0,
        recentPayments: 0
      };
    }
  }

  async getCashFlowData(organizationId: string, period: string = 'monthly') {
    try {
      const payments = await Payment.find({ organizationId })
        .sort({ paymentDate: -1 })
        .limit(100);

      // Group by month
      const monthlyData = payments.reduce((acc: any, payment) => {
        const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
        if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
        acc[month].income += payment.amount;
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        month,
        income: data.income,
        expenses: data.expenses
      })).slice(0, 12);
    } catch (error) {
      console.error('Cash flow data error:', error);
      return [];
    }
  }

  async getUpcomingReminders(organizationId: string) {
    try {
      const upcoming = await Reminder.find({
        organizationId,
        status: 'active',
        nextRunDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('tenantId', 'name unit')
      .populate('propertyId', 'name')
      .sort({ nextRunDate: 1 })
      .limit(10);

      return upcoming;
    } catch (error) {
      console.error('Upcoming reminders error:', error);
      return [];
    }
  }
}

export default new DashboardService();