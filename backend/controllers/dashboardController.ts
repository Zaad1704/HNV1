import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import dashboardService from '../services/dashboardService';

interface AuthRequest extends Request {
  user?: any;
}

const safeAsync = (fn: (req: AuthRequest, res: Response) => Promise<any>) => {
  return async (req: AuthRequest, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error('Dashboard controller error:', error);
      if (!res.headersSent) {
        res.status(200).json({ 
          success: true, 
          data: [] 
        });
      }
    }
  };
};

export const getOverviewStats = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const organizationId = req.user.organizationId;
  const totalProperties = await Property.countDocuments({ organizationId }) || 0;
  const activeTenants = await Tenant.countDocuments({ organizationId, status: 'Active' }) || 0;
  
  const monthlyRevenue = await Payment.aggregate([
    { $match: { organizationId, status: { $in: ['Paid', 'completed', 'Completed'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const occupancyRate = totalProperties > 0 ? Math.round((activeTenants / totalProperties) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalProperties,
      activeTenants,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      occupancyRate
    }
  });
});

export const getLateTenants = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const lateTenants = await Tenant.find({
    organizationId: req.user.organizationId,
    status: { $in: ['Late', 'Overdue'] }
  }).limit(5) || [];

  res.status(200).json({ success: true, data: lateTenants });
});

export const getExpiringLeases = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const today = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  const expiringLeases = await Tenant.find({
    organizationId: req.user.organizationId,
    leaseEndDate: { $gte: today, $lte: threeMonthsFromNow },
    status: 'Active'
  }).limit(5) || [];

  res.status(200).json({ success: true, data: expiringLeases });
});

export const getFinancialSummary = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const monthlyData = [];
  for (let i = 0; i < 6; i++) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - (5 - i));
    monthStart.setDate(1);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

    const revenue = await Payment.aggregate([
      { $match: { organizationId: req.user.organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd }, status: { $in: ['Paid', 'completed', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenses = await Expense.aggregate([
      { $match: { organizationId: req.user.organizationId, date: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    monthlyData.push({
      name: monthName,
      Revenue: revenue[0]?.total || 0,
      Expenses: expenses[0]?.total || 0
    });
  }

  res.status(200).json({ success: true, data: monthlyData });
});

export const getRentStatus = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const activeCount = await Tenant.countDocuments({ organizationId: req.user.organizationId, status: 'Active' }) || 0;
  const lateCount = await Tenant.countDocuments({ organizationId: req.user.organizationId, status: 'Late' }) || 0;
  
  const data = [
    { name: 'Paid / Current', value: activeCount },
    { name: 'Overdue', value: lateCount }
  ];

  res.status(200).json({ success: true, data });
});

export const getStats = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const stats = await dashboardService.getDashboardStats(req.user.organizationId);
  res.status(200).json({ success: true, data: stats });
});

export const getDashboardStats = safeAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user?.organizationId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const stats = await dashboardService.getDashboardStats(req.user.organizationId);
  res.status(200).json({ success: true, data: stats });
});