import { Request, Response } from 'express'; // FIX: Import Request
// FIX: AuthenticatedRequest is no longer needed.
import Invoice from '../models/Invoice';
import Lease from '../models/Lease';
import { addMonths, startOfMonth } from 'date-fns';

export const generateInvoices = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    try {
        // FIX: Fetch active leases for the organization instead of all tenants
        const activeLeases = await Lease.find({ 
            organizationId: req.user.organizationId,
            status: 'active'
        });

        if (activeLeases.length === 0) {
            return res.status(200).json({ success: true, message: 'No active leases found to generate invoices for.' });
        }

        const invoicesToCreate = activeLeases.map(lease => ({
            tenantId: lease.tenantId,
            propertyId: lease.propertyId,
            organizationId: lease.organizationId,
            leaseId: lease._id,
            amount: lease.rentAmount,
            dueDate: startOfMonth(addMonths(new Date(), 1)),
            status: 'pending',
            lineItems: [{ description: 'Monthly Rent', amount: lease.rentAmount }]
        }));

        await Invoice.insertMany(invoicesToCreate);
        res.status(201).json({ success: true, message: `${invoicesToCreate.length} invoices generated successfully.` });

    } catch (error) {
        console.error('Invoice generation failed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
