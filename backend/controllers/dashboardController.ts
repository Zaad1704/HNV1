// backend/controllers/dashboardController.ts
import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import { IUser } from '../models/User';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const getOverviewStats = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
  
    try {
      const propertyCount = await Property.countDocuments({ organizationId: user.organizationId });
      const tenantCount = await Tenant.countDocuments({ organizationId: user.organizationId, status: 'Active' });
      
      const unitsCountResult = await Property.aggregate([
          { $match: { organizationId: user.organizationId } },
          { $group: { _id: null, total: { $sum: "$numberOfUnits" } } }
      ]);
      const totalUnits = unitsCountResult[0]?.total || 0;
      
      const occupancyRate = totalUnits > 0 ? (tenantCount / totalUnits) : 0;

      const thisMonthStart = startOfMonth(new Date());
      const thisMonthEnd = endOfMonth(new Date());

      const monthlyPayments = await Payment.aggregate([
          { $match: { organizationId: user.organizationId, paymentDate: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const monthlyRevenue = monthlyPayments[0]?.total || 0;

      res.status(200).json({
        success: true,
        data: {
          totalProperties: propertyCount,
          activeTenants: tenantCount,
          occupancyRate: occupancyRate,
          monthlyRevenue: monthlyRevenue
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getFinancialSummary = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const summary = [];
        for (let i = 11; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const revenue = await Payment.aggregate([
                { $match: { organizationId: user.organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const expenses = await Expense.aggregate([
                { $match: { organizationId: user.organizationId, date: { $gte: monthStart, $lte: monthEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            summary.push({
                name: monthName,
                Revenue: revenue[0]?.total || 0,
                Expenses: expenses[0]?.total || 0,
            });
        }
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getOccupancySummary = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const summary = [];
        for (let i = 11; i >= 0; i--) {
            const date = subMonths(new Date(), i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            const monthName = date.toLocaleString('default', { month: 'short' });

            const newTenants = await Tenant.countDocuments({
                organizationId: user.organizationId,
                createdAt: { $gte: monthStart, $lte: monthEnd }
            });

            summary.push({
                name: monthName,
                "New Tenants": newTenants,
            });
        }
        res.status(200).json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
