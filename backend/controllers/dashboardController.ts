// backend/controllers/dashboardController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense'; // Import Expense model
import { startOfMonth, endOfMonth, subMonths, format, addDays } from 'date-fns';

export const getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
    // ... implementation remains the same
});

export const getLateTenants = asyncHandler(async (req: Request, res: Response) => {
    // ... implementation remains the same
});

export const getExpiringLeases = asyncHandler(async (req: Request, res: Response) => {
    // ... implementation remains the same
});

// --- NEW FUNCTION for Financial Chart ---
export const getFinancialSummary = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) { throw new Error('User not authorized'); }
    const organizationId = req.user.organizationId;
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        const revenuePromise = Payment.aggregate([
            { $match: { organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const expensePromise = Expense.aggregate([
            { $match: { organizationId, date: { $gte: monthStart, $lte: monthEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const [revenueResult, expenseResult] = await Promise.all([revenuePromise, expensePromise]);

        monthlyData.push({
            name: format(monthStart, 'MMM'),
            Revenue: revenueResult[0]?.total || 0,
            Expenses: expenseResult[0]?.total || 0,
        });
    }

    res.status(200).json({ success: true, data: monthlyData });
});

// --- NEW FUNCTION for Occupancy Chart ---
export const getOccupancySummary = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) { throw new Error('User not authorized'); }
    const organizationId = req.user.organizationId;
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        const newTenants = await Tenant.countDocuments({
            organizationId,
            createdAt: { $gte: monthStart, $lte: monthEnd }
        });

        monthlyData.push({
            name: format(monthStart, 'MMM'),
            "New Tenants": newTenants,
        });
    }
    
    res.status(200).json({ success: true, data: monthlyData });
});
