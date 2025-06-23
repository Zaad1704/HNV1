import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import AuditLog from '../models/AuditLog';
import { startOfMonth, endOfMonth, subMonths, format, addDays } from 'date-fns';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Re-import AuthenticatedRequest

export const getOverviewStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

export const getLateTenants = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;
    
    // Find tenants with 'Late' status for this organization
    const lateTenants = await Tenant.find({ organizationId, status: 'Late' })
        .populate('propertyId', 'name unit') // Populate property name
        .select('name email unit propertyId') // Select only necessary fields
        .limit(5); // Limit to a few for the dashboard widget

    res.status(200).json({ success: true, data: lateTenants });
});

export const getExpiringLeases = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;

    const today = new Date();
    const threeMonthsFromNow = addMonths(today, 3); // Leases expiring in the next 3 months

    const expiringLeases = await Tenant.find({ 
        organizationId, 
        leaseEndDate: { $gte: today, $lte: threeMonthsFromNow },
        status: 'Active' // Only active leases
    })
    .populate('propertyId', 'name unit')
    .select('name email unit leaseEndDate propertyId')
    .sort({ leaseEndDate: 1 }) // Sort by soonest expiry
    .limit(5);

    res.status(200).json({ success: true, data: expiringLeases });
});

export const getFinancialSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;

    const sixMonthsAgo = subMonths(new Date(), 5); // Start from 6 months ago to include current month

    const monthlyData: { name: string; Revenue: number; Expenses: number; }[] = [];

    // Loop through the last 6 months
    for (let i = 0; i < 6; i++) {
        const monthStart = startOfMonth(addMonths(sixMonthsAgo, i));
        const monthEnd = endOfMonth(monthStart);
        const monthName = format(monthStart, 'MMM');

        const revenueResult = await Payment.aggregate([
            { $match: { 
                organizationId, 
                paymentDate: { $gte: monthStart, $lte: monthEnd }, 
                status: 'Paid' 
            }},
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } }}
        ]);

        const expensesResult = await Expense.aggregate([
            { $match: { 
                organizationId, 
                date: { $gte: monthStart, $lte: monthEnd } 
            }},
            { $group: { _id: null, totalExpenses: { $sum: '$amount' } }}
        ]);

        monthlyData.push({
            name: monthName,
            Revenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
            Expenses: expensesResult.length > 0 ? expensesResult[0].totalExpenses : 0,
        });
    }

    res.status(200).json({ success: true, data: monthlyData });
});

export const getOccupancySummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;

    const sixMonthsAgo = subMonths(new Date(), 5);
    const monthlyData: { name: string; 'New Tenants': number; }[] = [];

    for (let i = 0; i < 6; i++) {
        const monthStart = startOfMonth(addMonths(sixMonthsAgo, i));
        const monthEnd = endOfMonth(monthStart);
        const monthName = format(monthStart, 'MMM');

        const newTenantsCount = await Tenant.countDocuments({
            organizationId,
            createdAt: { $gte: monthStart, $lte: monthEnd }
        });

        monthlyData.push({
            name: monthName,
            'New Tenants': newTenantsCount,
        });
    }

    res.status(200).json({ success: true, data: monthlyData });
});


export const getRentStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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

export const getRecentActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');
    }
    const { organizationId } = req.user;

    const activities = await AuditLog.find({ organizationId })
        .populate('user', 'name')
        .sort({ timestamp: -1 })
        .limit(5);

    res.status(200).json({ success: true, data: activities });
});
