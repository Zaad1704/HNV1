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

// @desc    Get all maintenance requests for the user's organization
// @route   GET /api/maintenance-requests
export const getMaintenanceRequests = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId })
            .populate('tenantId', 'name')
            .populate('propertyId', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update the status of a maintenance request
// @route   PUT /api/maintenance-requests/:id
export const updateMaintenanceRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    try {
        const request = await MaintenanceRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found.' });
        }
        
        // Security check: ensure the request belongs to the user's organization
        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Access Denied.' });
        }

        request.status = status;
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
