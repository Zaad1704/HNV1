import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Invoice from '../models/Invoice';
import Tenant, { ITenant } from '../models/Tenant';
import Property, { IProperty } from '../models/Property';
import Organization, { IOrganization } from '../models/Organization';
import User, { IUser } from '../models/User';
import Lease, { ILease } from '../models/Lease';
import { addMonths, startOfMonth } from 'date-fns';

// Define a type for the fully populated Tenant document
interface IPopulatedTenant extends Omit<ITenant, 'propertyId' | 'organizationId'> {
    propertyId: IProperty;
    organizationId: IOrganization;
    leaseId: ILease;
}

export const generateInvoices = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    try {
        const tenants = await Tenant.find({ organizationId: req.user.organizationId })
            .populate('propertyId')
            .populate('leaseId');

        const invoicesToCreate = tenants.map(tenant => {
            const populatedTenant = tenant as IPopulatedTenant;
            if (!populatedTenant.leaseId) return null; // Skip tenants without a lease

            return {
                tenantId: populatedTenant._id,
                propertyId: populatedTenant.propertyId._id,
                organizationId: populatedTenant.organizationId._id,
                leaseId: populatedTenant.leaseId._id,
                amount: populatedTenant.leaseId.rentAmount,
                dueDate: startOfMonth(addMonths(new Date(), 1)),
                status: 'pending',
                lineItems: [{ description: 'Monthly Rent', amount: populatedTenant.leaseId.rentAmount }]
            };
        }).filter(item => item !== null);

        if (invoicesToCreate.length > 0) {
            await Invoice.insertMany(invoicesToCreate);
        }
        res.status(201).json({ success: true, message: `${invoicesToCreate.length} invoices generated successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
