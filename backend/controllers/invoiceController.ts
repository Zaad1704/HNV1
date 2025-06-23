// backend/controllers/invoiceController.ts
import { Response } from 'express';
import Invoice from '../models/Invoice';
import Lease from '../models/Lease';
import { addMonths, startOfMonth, format } from 'date-fns';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const generateInvoices = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ message: 'Not authorized or not part of an organization' });
    }

    try {
        const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : addMonths(new Date(), 1);
        const invoiceMonthStart = startOfMonth(targetDate);
        
        const activeLeases = await Lease.find({ 
            organizationId: req.user.organizationId,
            status: 'active'
        }).populate('tenantId').populate('propertyId');

        if (activeLeases.length === 0) {
            return res.status(200).json({ success: true, message: 'No active leases found to generate invoices for.' });
        }

        const invoicesToCreate = [];
        for (const lease of activeLeases) {
            const existingInvoice = await Invoice.findOne({
                leaseId: lease._id,
                dueDate: invoiceMonthStart,
                status: { $in: ['pending', 'overdue'] }
            });

            if (existingInvoice) {
                console.log(`Invoice already exists for lease ${lease._id} for ${format(invoiceMonthStart, 'MMM YYYY')}, skipping.`);
                continue;
            }

            const countForMonth = await Invoice.countDocuments({
                organizationId: req.user.organizationId,
                dueDate: invoiceMonthStart,
            });
            const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${format(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;

            const lineItems = [
                { description: 'Monthly Rent', amount: lease.rentAmount },
            ];
            const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

            invoicesToCreate.push({
                tenantId: lease.tenantId,
                propertyId: lease.propertyId,
                organizationId: lease.organizationId,
                leaseId: lease._id,
                invoiceNumber: invoiceNumber,
                amount: totalAmount,
                dueDate: invoiceMonthStart,
                status: 'pending',
                lineItems: lineItems,
            });
        }

        if (invoicesToCreate.length > 0) {
            await Invoice.insertMany(invoicesToCreate);
            res.status(201).json({ success: true, message: `${invoicesToCreate.length} new invoices generated successfully for ${format(invoiceMonthStart, 'MMM YYYY')}.` });
        } else {
            res.status(200).json({ success: true, message: 'No new invoices needed for generation this month.' });
        }

    } catch (error) {
        console.error('Invoice generation failed:', error);
        res.status(500).json({ success: false, message: 'Server Error during invoice generation.' });
    }
};
