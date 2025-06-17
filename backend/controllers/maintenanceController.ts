import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Tenant from '../models/Tenant';

// @desc    Create a new maintenance request
// @route   POST /api/maintenance-requests
export const createMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || req.user.role !== 'Tenant') {
        return res.status(403).json({ success: false, message: 'Access Denied' });
    }

    const { category, description, imageUrl } = req.body;
    if (!category || !description) {
        return res.status(400).json({ success: false, message: 'Category and description are required.' });
    }

    try {
        const tenant = await Tenant.findOne({ email: req.user.email, organizationId: req.user.organizationId });
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        }

        const newRequest = await MaintenanceRequest.create({
            tenantId: tenant._id,
            propertyId: tenant.propertyId,
            organizationId: tenant.organizationId,
            category,
            description,
            imageUrl
        });

        res.status(201).json({ success: true, data: newRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
