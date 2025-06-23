import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import AuditLog from '../models/AuditLog'; // Import AuditLog model
import { startOfMonth, endOfMonth, subMonths, format, addDays } from 'date-fns';

export const getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
    // ... this function remains the same
    if (!req.user) { 
        throw new Error('User not authorized');
    }
    const organizationId = req.user.organizationId; 

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
    // ... this function remains the same
});

export const getExpiringLeases = asyncHandler(async (req: Request, res: Response) => {
    // ... this function remains the same
});

export const getFinancialSummary = asyncHandler(async (req: Request, res: Response) => {
    // ... this function remains the same
});

export const getOccupancySummary = asyncHandler(async (req: Request, res: Response) => {
    // ... this function remains the same
});

// --- NEW FUNCTION for Rent Status Chart ---
export const getRentStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;

    const activeCount = await Tenant.countDocuments({ organizationId, status: 'Active' });
    const lateCount = await Tenant.countDocuments({ organizationId, status: 'Late' });

    const data = [
        { name: 'Paid / Current', value: activeCount },
        { name: 'Overdue', value: lateCount },
    ];

    res.status(200).json({ success: true, data });
});

// --- NEW FUNCTION for Recent Activity Feed ---
export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;

    const activities = await AuditLog.find({ organizationId })
        .populate('user', 'name')
        .sort({ timestamp: -1 })
        .limit(5); // Get the 5 most recent activities

    res.status(200).json({ success: true, data: activities });
});
