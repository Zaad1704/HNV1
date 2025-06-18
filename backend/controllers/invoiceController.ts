import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Invoice from '../models/Invoice';
import Tenant, { ITenant } from '../models/Tenant';
import Property, { IProperty } from '../models/Property';
import Organization, { IOrganization } from '../models/Organization';
import Lease, { ILease } from '../models/Lease';
import { addMonths, startOfMonth } from 'date-fns'; // FIX: date-fns is now a dependency

// FIX: Create a specific interface for the populated document to resolve type errors
interface IPopulatedTenant extends Omit<ITenant, 'propertyId' | 'organizationId'> {
    propertyId: IProperty;
    organizationId: IOrganization & { owner: IUser };
    leaseId: ILease;
}

export const generateInvoices = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    try {
        const tenants = await Tenant.find({ organizationId: req.user.organizationId })
            .populate<{ propertyId: IProperty }>('propertyId')
            .populate<{ leaseId: ILease }>('leaseId');

        const invoices = tenants.map(tenant => {
            const populatedTenant = tenant as unknown as IPopulatedTenant; // Cast to the correct populated type
            
            return {
                tenantId: populatedTenant._id,
                propertyId: populatedTenant.propertyId._id,
                organizationId: populatedTenant.organizationId._id,
                amount: populatedTenant.leaseId.rentAmount,
                dueDate: startOfMonth(addMonths(new Date(), 1)),
                status: 'pending'
            };
        });

        await Invoice.insertMany(invoices);
        res.status(201).json({ success: true, message: `${invoices.length} invoices generated successfully.` });

    } catch (error) {
        console.error('Invoice generation failed:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
