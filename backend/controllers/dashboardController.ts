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

// ... (other dashboard functions like getLateTenants, getFinancialSummary, etc. would also be in this file)
