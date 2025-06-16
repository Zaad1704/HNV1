import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import Payment from '../models/Payment';
import User from '../models/User';

export const getTenantDashboardData = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'Tenant') {
        return res.status(403).json({ success: false, message: 'Access denied. Not a tenant.' });
    }

    try {
        // Find the tenant record linked to the logged-in user's email and organization
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

        // Find recent payments for this tenant
        const paymentHistory = await Payment.find({ tenantId: tenantInfo._id })
            .sort({ paymentDate: -1 })
            .limit(10);
            
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
                }
            },
            paymentHistory
        };

        res.status(200).json({ success: true, data: dashboardData });

    } catch (error) {
        console.error('Error fetching tenant dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
