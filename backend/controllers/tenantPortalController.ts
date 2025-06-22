import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Payment from '../models/Payment';
import User from '../models/User';
import Lease from '../models/Lease'; // Import Lease model

export const getTenantDashboardData = async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'Tenant') {
        return res.status(403).json({ success: false, message: 'Access denied. Not a tenant.' });
    }

    try {
        const tenantInfo = await Tenant.findOne({ 
            email: req.user.email, 
            organizationId: req.user.organizationId 
        }).populate({
            path: 'propertyId',
            select: 'name address createdBy', // Fetch property details
            populate: {
                path: 'createdBy', // This is the Landlord/Agent user
                model: 'User',
                select: 'name email' // Fetch landlord's contact info
            }
        });

        if (!tenantInfo) {
            return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        }

        // Find the active lease for this tenant to get current rentAmount
        const activeLease = await Lease.findOne({ tenantId: tenantInfo._id, status: 'active' });

        // Find recent payments for this tenant
        const paymentHistory = await Payment.find({ tenantId: tenantInfo._id })
            .sort({ paymentDate: -1 })
            .limit(10);
            
        // NEW: Mock Upcoming Dues Breakdown
        // In a real system, this would come from generated invoices or calculated based on lease and utility bills.
        // For now, let's simulate a basic breakdown for the current month's rent.
        const upcomingDues = {
            totalAmount: tenantInfo.rentAmount || 0, // Base on tenant's rentAmount
            lineItems: [
                { description: 'Monthly Rent', amount: tenantInfo.rentAmount || 0 },
                // You could add mock utility bills here if needed for testing frontend
                // { description: 'Electricity Bill', amount: 50.00 },
                // { description: 'Water Bill', amount: 30.00 }
            ],
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0], // 1st of next month
        };

        // Construct the dashboard data object
        const dashboardData = {
            leaseInfo: {
                property: {
                    name: (tenantInfo.propertyId as any)?.name,
                    street: (tenantInfo.propertyId as any)?.address.street,
                    city: (tenantInfo.propertyId as any)?.address.city,
                },
                unit: tenantInfo.unit,
                status: tenantInfo.status,
                landlord: {
                    name: (tenantInfo.propertyId as any)?.createdBy.name,
                    email: (tenantInfo.propertyId as any)?.createdBy.email,
                },
                rentAmount: tenantInfo.rentAmount, // Include rentAmount
                leaseEndDate: tenantInfo.leaseEndDate, // Include leaseEndDate
            },
            paymentHistory,
            upcomingDues, // NEW: Include upcomingDues
        };

        res.status(200).json({ success: true, data: dashboardData });

    } catch (error) {
        console.error('Error fetching tenant dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
