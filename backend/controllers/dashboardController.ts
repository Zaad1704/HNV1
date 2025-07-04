import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';

interface AuthRequest extends Request {
  user?: any;
}

export const getOverviewStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const organizationId = req.user.organizationId;
    const totalProperties = await Property.countDocuments({ organizationId });
    const activeTenants = await Tenant.countDocuments({ organizationId, status: 'Active' });
    
    const monthlyRevenue = await Payment.aggregate([
      { $match: { organizationId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const occupancyRate = totalProperties > 0 ? ((activeTenants / totalProperties) * 100).toFixed(2) + '%' : '0%';

    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        activeTenants,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        occupancyRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getLateTenants = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const lateTenants = await Tenant.find({
      organizationId: req.user.organizationId,
      status: { $in: ['Late', 'Overdue'] }
    }).limit(5);

    res.status(200).json({ success: true, data: lateTenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getExpiringLeases = async (req: AuthRequest, res: Response) => {
  try {
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
    }).limit(5);

    res.status(200).json({ success: true, data: expiringLeases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getFinancialSummary = async (req: AuthRequest, res: Response) => {
  try {
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
        { $match: { organizationId: req.user.organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd }, status: 'completed' } },
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRentStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const activeCount = await Tenant.countDocuments({ organizationId: req.user.organizationId, status: 'Active' });
    const lateCount = await Tenant.countDocuments({ organizationId: req.user.organizationId, status: 'Late' });
    
    const data = [
      { name: 'Paid / Current', value: activeCount },
      { name: 'Overdue', value: lateCount }
    ];

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const totalProperties = await Property.countDocuments({ organizationId: req.user.organizationId });
    const activeTenants = await Tenant.countDocuments({ organizationId: req.user.organizationId, status: 'Active' });
    
    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        activeTenants,
        monthlyRevenue: 5000,
        occupancyRate: totalProperties > 0 ? ((activeTenants / totalProperties) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};