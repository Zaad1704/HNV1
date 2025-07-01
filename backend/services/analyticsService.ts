import RentCollectionPeriod from '../models/RentCollectionPeriod';
import CollectionAnalytics from '../models/CollectionAnalytics';
import Payment from '../models/Payment';
import Property from '../models/Property';

class AnalyticsService {
  async generateCollectionAnalytics(organizationId: string, startDate: Date, endDate: Date): Promise<any> {
    const periods = await RentCollectionPeriod.find({
      organizationId,
      generatedAt: { $gte: startDate, $lte: endDate }
    }).sort({ 'period.year': -1, 'period.month': -1 });

    if (periods.length === 0) return null;

    // Calculate performance metrics
    const totalExpected = periods.reduce((sum, p) => sum + p.summary.expectedRent, 0);
    const totalCollected = periods.reduce((sum, p) => sum + p.summary.collectedRent, 0);
    const averageCollectionRate = periods.reduce((sum, p) => sum + p.summary.collectionRate, 0) / periods.length;

    // Get previous period for trends
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - periods.length);
    
    const previousPeriods = await RentCollectionPeriod.find({
      organizationId,
      generatedAt: { $gte: previousPeriodStart, $lt: startDate }
    });

    const previousCollectionRate = previousPeriods.length > 0 
      ? previousPeriods.reduce((sum, p) => sum + p.summary.collectionRate, 0) / previousPeriods.length
      : 0;

    // Property breakdown
    const propertyStats = new Map();
    periods.forEach(period => {
      period.tenants.forEach(tenant => {
        const key = tenant.property;
        if (!propertyStats.has(key)) {
          propertyStats.set(key, {
            name: key,
            totalDue: 0,
            collected: 0,
            tenantCount: 0
          });
        }
        const stats = propertyStats.get(key);
        stats.totalDue += tenant.totalOwed;
        if (tenant.status === 'paid') {
          stats.collected += tenant.totalOwed;
        }
        stats.tenantCount++;
      });
    });

    const byProperty = Array.from(propertyStats.values()).map(stats => ({
      ...stats,
      outstanding: stats.totalDue - stats.collected,
      collectionRate: stats.totalDue > 0 ? (stats.collected / stats.totalDue) * 100 : 0
    }));

    // Payment method breakdown (mock data for now)
    const byPaymentMethod = {
      online: { percentage: 68, amount: totalCollected * 0.68 },
      check: { percentage: 22, amount: totalCollected * 0.22 },
      cash: { percentage: 8, amount: totalCollected * 0.08 },
      other: { percentage: 2, amount: totalCollected * 0.02 }
    };

    // Timing breakdown
    const allTenants = periods.flatMap(p => p.tenants);
    const onTimeCount = allTenants.filter(t => t.status === 'paid' && t.daysLate <= 0).length;
    const lateCount = allTenants.filter(t => t.status === 'paid' && t.daysLate > 0).length;
    const pendingCount = allTenants.filter(t => t.status !== 'paid').length;
    const totalCount = allTenants.length;

    const byTiming = {
      early: { count: 0, percentage: 0 },
      onTime: { count: onTimeCount, percentage: totalCount > 0 ? (onTimeCount / totalCount) * 100 : 0 },
      late: { count: lateCount, percentage: totalCount > 0 ? (lateCount / totalCount) * 100 : 0 }
    };

    // Problem tenants
    const tenantStats = allTenants.reduce((acc, tenant) => {
      const key = tenant.tenantId.toString();
      if (!acc[key]) {
        acc[key] = {
          tenantId: tenant.tenantId,
          name: tenant.name,
          property: tenant.property,
          totalOwed: 0,
          appearances: 0,
          totalDaysLate: 0,
          missedPayments: 0
        };
      }
      acc[key].totalOwed += tenant.totalOwed;
      acc[key].appearances++;
      acc[key].totalDaysLate += tenant.daysLate;
      if (tenant.status === 'overdue') {
        acc[key].missedPayments++;
      }
      return acc;
    }, {} as Record<string, any>);

    const problemTenants = Object.values(tenantStats)
      .filter((t: any) => t.totalDaysLate / t.appearances > 5)
      .map((t: any) => ({
        ...t,
        riskScore: t.totalDaysLate / t.appearances > 15 ? 'high' : 
                  t.totalDaysLate / t.appearances > 10 ? 'medium' : 'low'
      }))
      .sort((a: any, b: any) => b.totalOwed - a.totalOwed)
      .slice(0, 10);

    return {
      performance: {
        collectionRate: Math.round(averageCollectionRate * 100) / 100,
        averageDaysToCollect: 5.2, // Mock data
        totalCollected,
        totalOutstanding: totalExpected - totalCollected,
        trends: {
          collectionRateChange: averageCollectionRate - previousCollectionRate,
          outstandingChange: -8.5, // Mock data
          averageDaysChange: -1.2 // Mock data
        }
      },
      breakdown: {
        byProperty,
        byPaymentMethod,
        byTiming
      },
      problemTenants
    };
  }

  async getCollectionTrends(organizationId: string, months: number = 12): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const periods = await RentCollectionPeriod.find({
      organizationId,
      generatedAt: { $gte: startDate, $lte: endDate }
    }).sort({ 'period.year': 1, 'period.month': 1 });

    return periods.map(period => ({
      month: period.period.month,
      year: period.period.year,
      collectionRate: period.summary.collectionRate,
      collected: period.summary.collectedRent,
      outstanding: period.summary.outstandingRent,
      totalUnits: period.summary.totalUnits
    }));
  }

  async getPropertyPerformance(organizationId: string): Promise<any> {
    const properties = await Property.find({ organizationId }).lean();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const period = await RentCollectionPeriod.findOne({
      organizationId,
      'period.year': currentYear,
      'period.month': currentMonth
    });

    if (!period) return [];

    const propertyPerformance = properties.map(property => {
      const tenants = period.tenants.filter(t => t.property === property.name);
      const totalDue = tenants.reduce((sum, t) => sum + t.totalOwed, 0);
      const collected = tenants.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.totalOwed, 0);
      
      return {
        propertyId: property._id,
        name: property.name,
        tenantCount: tenants.length,
        totalDue,
        collected,
        outstanding: totalDue - collected,
        collectionRate: totalDue > 0 ? (collected / totalDue) * 100 : 0,
        averageDaysLate: tenants.reduce((sum, t) => sum + t.daysLate, 0) / tenants.length || 0
      };
    });

    return propertyPerformance.sort((a, b) => b.collectionRate - a.collectionRate);
  }

  async getTenantRiskAnalysis(organizationId: string): Promise<any> {
    const periods = await RentCollectionPeriod.find({
      organizationId,
      generatedAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } // Last 6 months
    });

    const tenantRisks = new Map();

    periods.forEach(period => {
      period.tenants.forEach(tenant => {
        const key = tenant.tenantId.toString();
        if (!tenantRisks.has(key)) {
          tenantRisks.set(key, {
            tenantId: tenant.tenantId,
            name: tenant.name,
            property: tenant.property,
            totalPayments: 0,
            latePayments: 0,
            totalDaysLate: 0,
            totalOwed: 0,
            lastPaymentDate: null
          });
        }
        
        const risk = tenantRisks.get(key);
        risk.totalPayments++;
        if (tenant.daysLate > 0) {
          risk.latePayments++;
          risk.totalDaysLate += tenant.daysLate;
        }
        risk.totalOwed += tenant.totalOwed;
        if (tenant.paymentHistory?.lastPayment) {
          risk.lastPaymentDate = tenant.paymentHistory.lastPayment;
        }
      });
    });

    return Array.from(tenantRisks.values()).map(risk => {
      const latePaymentRate = risk.totalPayments > 0 ? (risk.latePayments / risk.totalPayments) * 100 : 0;
      const averageDaysLate = risk.latePayments > 0 ? risk.totalDaysLate / risk.latePayments : 0;
      
      let riskScore = 'low';
      if (latePaymentRate > 50 || averageDaysLate > 15) {
        riskScore = 'high';
      } else if (latePaymentRate > 25 || averageDaysLate > 7) {
        riskScore = 'medium';
      }

      return {
        ...risk,
        latePaymentRate,
        averageDaysLate,
        riskScore
      };
    }).sort((a, b) => b.latePaymentRate - a.latePaymentRate);
  }
}

export default new AnalyticsService();