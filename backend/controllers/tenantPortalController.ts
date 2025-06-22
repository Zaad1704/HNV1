import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Payment from '../models/Payment';
import User from '../models/User';
import Lease from '../models/Lease';
import Invoice from '../models/Invoice'; // NEW IMPORT: Invoice model
import { startOfMonth } from 'date-fns'; // NEW IMPORT: for date comparison

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
            select: 'name address createdBy',
            populate: {
                path: 'createdBy',
                model: 'User',
                select: 'name email'
            }
        });

        if (!tenantInfo) {
            return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        }

        const activeLease = await Lease.findOne({ tenantId: tenantInfo._id, status: 'active' });

        const paymentHistory = await Payment.find({ tenantId: tenantInfo._id })
            .sort({ paymentDate: -1 })
            .limit(10);
            
        // NEW: Fetch Real Upcoming Dues/Outstanding Invoices
        const today = new Date();
        const currentMonthStart = startOfMonth(today);

        const outstandingInvoice = await Invoice.findOne({
            tenantId: tenantInfo._id,
            status: 'pending', // Only pending invoices are "due"
            dueDate: { $gte: currentMonthStart }, // Due date is today or in the future
        }).sort({ dueDate: 1 }); // Get the soonest due invoice

        const upcomingDues = outstandingInvoice ? {
            invoiceId: outstandingInvoice._id, // Pass invoice ID
            invoiceNumber: outstandingInvoice.invoiceNumber, // Pass invoice number
            totalAmount: outstandingInvoice.amount,
            lineItems: outstandingInvoice.lineItems,
            dueDate: outstandingInvoice.dueDate.toISOString().split('T')[0], // YYYY-MM-DD
        } : undefined;

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
                rentAmount: tenantInfo.rentAmount,
                leaseEndDate: tenantInfo.leaseEndDate,
            },
            paymentHistory,
            upcomingDues, // Now this will be a real invoice or undefined
        };

        res.status(200).json({ success: true, data: dashboardData });

    } catch (error) {
        console.error('Error fetching tenant dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
