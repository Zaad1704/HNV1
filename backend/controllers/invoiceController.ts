import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Lease from '../models/Lease';
import { addMonths, startOfMonth, format } from 'date-fns'; // Import format for invoice number

export const generateInvoices = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    try {
        const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : addMonths(new Date(), 1); // Default to next month
        const invoiceMonthStart = startOfMonth(targetDate);
        
        // Fetch active leases for the organization
        const activeLeases = await Lease.find({ 
            organizationId: req.user.organizationId,
            status: 'active'
        }).populate('tenantId').populate('propertyId'); // Populate for details

        if (activeLeases.length === 0) {
            return res.status(200).json({ success: true, message: 'No active leases found to generate invoices for.' });
        }

        const invoicesToCreate = [];
        for (const lease of activeLeases) {
            // Check if an invoice already exists for this lease for the target month
            const existingInvoice = await Invoice.findOne({
                leaseId: lease._id,
                dueDate: invoiceMonthStart, // Assuming dueDate is the 1st of the month
                status: { $in: ['pending', 'overdue'] } // Only create if not already paid/canceled
            });

            if (existingInvoice) {
                console.log(`Invoice already exists for lease ${lease._id} for ${format(invoiceMonthStart, 'MMM yyyy')}, skipping.`);
                continue;
            }

            // Generate a simple invoice number (e.g., INV-ORGID-YYYYMM-COUNTER)
            const countForMonth = await Invoice.countDocuments({
                organizationId: req.user.organizationId,
                dueDate: invoiceMonthStart,
            });
            const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${format(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;

            // Example Line Items (you can expand this based on actual bills)
            const lineItems = [
                { description: 'Monthly Rent', amount: lease.rentAmount },
                // Add mock utility bills if needed for testing frontend
                // { description: 'Electricity', amount: 50.00 },
                // { description: 'Water', amount: 30.00 }
            ];
            const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

            invoicesToCreate.push({
                tenantId: lease.tenantId,
                propertyId: lease.propertyId,
                organizationId: lease.organizationId,
                leaseId: lease._id,
                invoiceNumber: invoiceNumber,
                amount: totalAmount,
                dueDate: invoiceMonthStart, // Invoice due on the 1st of the month
                status: 'pending',
                lineItems: lineItems,
            });
        }

        if (invoicesToCreate.length > 0) {
            await Invoice.insertMany(invoicesToCreate);
            res.status(201).json({ success: true, message: `${invoicesToCreate.length} new invoices generated successfully for ${format(invoiceMonthStart, 'MMM yyyy')}.` });
        } else {
            res.status(200).json({ success: true, message: 'No new invoices needed for generation this month.' });
        }

    } catch (error) {
        console.error('Invoice generation failed:', error);
        res.status(500).json({ success: false, message: 'Server Error during invoice generation.' });
    }
};
