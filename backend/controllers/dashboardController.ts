import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';

export const getOverviewStats = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const { organizationId } = req.user;

    try {
        const totalProperties = await Property.countDocuments({ organizationId });
        const totalTenants = await Tenant.countDocuments({ organizationId });
        const activeTenants = await Tenant.countDocuments({ organizationId, status: 'Active' });

        const occupancyRate = totalTenants > 0 ? (activeTenants / totalTenants) : 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const monthlyPayments = await Payment.find({
            organizationId,
            paymentDate: { $gte: startOfMonth, $lt: endOfMonth },
            status: 'Paid'
        });

        const monthlyRevenue = monthlyPayments.reduce((acc, payment) => acc + payment.amount, 0);

        const stats = {
            totalProperties,
            activeTenants,
            occupancyRate: parseFloat(occupancyRate.toFixed(2)),
            monthlyRevenue: monthlyRevenue
        };

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getLateTenants = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const lateTenants = await Tenant.find({
            organizationId: req.user.organizationId,
            status: 'Late'
        }).populate('propertyId', 'name unit');

        res.status(200).json({ success: true, data: lateTenants });

    } catch (error) {
        console.error("Error fetching late tenants:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getFinancialSummary = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const revenueData = await Payment.aggregate([
            { $match: { organizationId: req.user.organizationId, date: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                totalRevenue: { $sum: "$amount" }
            }},
        ]);

        const expenseData = await Expense.aggregate([
            { $match: { organizationId: req.user.organizationId, date: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                totalExpenses: { $sum: "$amount" }
            }},
        ]);

        const summary = Array.from({ length: 12 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const revenue = revenueData.find(r => r._id.year === year && r._id.month === month)?.totalRevenue || 0;
            const expenses = expenseData.find(e => e._id.year === year && e._id.month === month)?.totalExpenses || 0;
            
            return {
                name: `${monthNames[month - 1]} ${String(year).slice(-2)}`,
                Revenue: revenue,
                Expenses: expenses,
            };
        }).reverse();
        
        res.status(200).json({ success: true, data: summary });

    } catch (error) {
        console.error("Error fetching financial summary:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getOccupancySummary = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const tenantData = await Tenant.aggregate([
            { $match: { organizationId: req.user.organizationId, createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                newTenants: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const summary = Array.from({ length: 12 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const tenants = tenantData.find(t => t._id.year === year && t._id.month === month)?.newTenants || 0;
            
            return {
                name: `${monthNames[month - 1]} ${String(year).slice(-2)}`,
                "New Tenants": tenants,
            };
        }).reverse();
        
        res.status(200).json({ success: true, data: summary });

    } catch (error) {
        console.error("Error fetching occupancy summary:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getExpiringLeases = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const now = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(now.getDate() + 60);

        const expiringLeases = await Tenant.find({
            organizationId: req.user.organizationId,
            leaseEndDate: { $gte: now, $lte: sixtyDaysFromNow }
        }).populate('propertyId', 'name unit').sort({ leaseEndDate: 1 });

        res.status(200).json({ success: true, data: expiringLeases });

    } catch (error) {
        console.error("Error fetching expiring leases:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
