import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Tenant from '../models/Tenant';

// ... (keep the existing createMaintenanceRequest function)

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
