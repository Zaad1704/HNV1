import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Payment from '../models/Payment';
import User from '../models/User';
import Lease from '../models/Lease';
import Invoice from '../models/Invoice';
import { startOfMonth } from 'date-fns';

export const getTenantDashboardData = async (req: Request, res: Response) => { 
    if (!req.user || req.user.role !== 'Tenant') {
        res.status(403).json({ success: false, message: 'Access denied. Not a tenant.' });
        return;
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
            res.status(404).json({ success: false, message: 'Tenant profile not found.' });
            return;
        }

        const activeLease = await Lease.findOne({ tenantId: tenantInfo._id, status: 'active' });

        const paymentHistory = await Payment.find({ tenantId: tenantInfo._id })
            .sort({ paymentDate: -1 })
            .limit(10);
            
        const today = new Date();
        const currentMonthStart = startOfMonth(today);

        const outstandingInvoice = await Invoice.findOne({
            tenantId: tenantInfo._id,
            status: 'pending',
            dueDate: { $gte: currentMonthStart },
        }).sort({ dueDate: 1 });

        const upcomingDues = outstandingInvoice ? {
            invoiceId: outstandingInvoice._id,
            invoiceNumber: outstandingInvoice.invoiceNumber,
            totalAmount: outstandingInvoice.amount,
            lineItems: outstandingInvoice.lineItems,
            dueDate: outstandingInvoice.dueDate.toISOString().split('T')[0],
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
            upcomingDues,
        };

        res.status(200).json({ success: true, data: dashboardData });

    } catch (error) {
        console.error('Error fetching tenant dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
