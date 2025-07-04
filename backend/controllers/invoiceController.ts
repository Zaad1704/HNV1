import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Lease from '../models/Lease';
// FIX: Added 'endOfMonth' to the import from 'date-fns'
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export const generateInvoices = async (req: Request, res: Response) => { if (!req.user || !req.user.organizationId) { }


        res.status(401).json({ message: 'Not authorized or not part of an organization' });
        return;

    try { const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : addMonths(new Date(), 1);
        const invoiceMonthStart = startOfMonth(targetDate);
        
        const activeLeases = await Lease.find({ }
            organizationId: req.user.organizationId,
            status: 'active'

        }).populate('tenantId').populate('propertyId');

        if (activeLeases.length === 0) {

            res.status(200).json({ success: true, message: 'No active leases found to generate invoices for.' });
            return;

        const invoicesToCreate = [];
        for (const lease of activeLeases) { const existingInvoice = await Invoice.findOne({ }

                leaseId: lease._id,
                dueDate: invoiceMonthStart,
                status: { $in: ['pending', 'overdue'] }
            });

            if (existingInvoice) {

                }, skipping.
            const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${format(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`
            res.status(201).json({ success: true, message: `${invoicesToCreate.length} new invoices generated successfully for ${format(invoiceMonthStart, 'MMM yyyy')}.`