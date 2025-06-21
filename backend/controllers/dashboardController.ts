// backend/controllers/dashboardController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import { startOfMonth, endOfMonth, subMonths, format, addDays } from 'date-fns';

export const getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) { // Added: Check req.user
        throw new Error('User not authorized');
    }
    const organizationId = req.user.organizationId; // Use organizationId from req.user

    const totalProperties = await Property.countDocuments({ organizationId });
    const activeTenants = await Tenant.countDocuments({ organizationId, status: 'Active' });
    
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const monthlyRevenue = await Payment.aggregate([
        { $match: { organizationId, paymentDate: { $gte: currentMonthStart, $lte: currentMonthEnd }, status: 'Paid' } },
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
});

export const getLateTenants = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) { // Added: Check req.user
        throw new Error('User not authorized');
    }
    const organizationId = req.user.organizationId;

    const lateTenants = await Tenant.find({ organizationId, status: 'Late' })
        .populate('propertyId', 'name'); // Populate property name
    res.status(200).json({ success: true, data: lateTenants });
});

export const getExpiringLeases = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) { // Added: Check req.user
        throw new Error('User not authorized');
    }
    const organizationId = req.user.organizationId;

    const sixtyDaysFromNow = addDays(new Date(), 60);
    const expiringLeases = await Tenant.find({
        organizationId,
        leaseEndDate: { $lte: sixtyDaysFromNow, $gte: new Date() },
        status: 'Active'
    }).populate('propertyId', 'name'); // Populate property name
    res.status(200).json({ success: true, data: expiringLeases });
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
            { $match: { organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd }, status: 'Paid' } },
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
