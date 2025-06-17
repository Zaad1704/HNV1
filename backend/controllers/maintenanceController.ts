// backend/controllers/maintenanceController.ts

import { Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';

export const createMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const { propertyId, description, status, priority, tenantId, category, notes, assignedTo } = req.body;

        if (!propertyId || !description) {
            return res.status(400).json({ success: false, message: 'Property ID and description are required.' });
        }

        const property = await Property.findById(propertyId);
        // REFACTOR: Directly use req.user.organizationId.toString() for comparison.
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to create requests for this property.' });
        }
        
        const isTenant = req.user.role === 'Tenant';

        const newRequest = await MaintenanceRequest.create({
            organizationId: req.user.organizationId,
            propertyId,
            // REFACTOR: If user is a tenant, automatically assign their ID. Otherwise, use what's provided.
            tenantId: isTenant ? req.user._id : (tenantId || undefined),
            description,
            status: status || 'Open',
            priority: priority || 'Medium',
            reportedBy: req.user._id,
            category,
            notes,
            assignedTo: assignedTo || undefined,
        });

        auditService.recordAction(req.user._id, req.user.organizationId, 'MAINTENANCE_REQUEST_CREATED', {
            requestId: newRequest._id.toString(),
            description: newRequest.description,
            propertyId: property._id.toString(),
        });

        res.status(201).json({ success: true, data: newRequest });
    } catch (error: any) {
        console.error("Error creating maintenance request:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getOrgMaintenanceRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId })
            .populate('propertyId', 'name address')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('tenantId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error: any) {
        console.error("Error fetching maintenance requests:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const getMaintenanceRequestById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const request = await MaintenanceRequest.findById(req.params.id)
            .populate('propertyId', 'name address')
            .populate('reportedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('tenantId', 'name email');

        if (!request) {
            return res.status(404).json({ success: false, message: 'Maintenance request not found' });
        }

        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this request.' });
        }

        if (req.user.role === 'Tenant' && request.reportedBy?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Tenants can only view their own reported requests.' });
        }

        res.status(200).json({ success: true, data: request });
    } catch (error: any) {
        console.error("Error fetching maintenance request by ID:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const updateMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // REFACTOR: Fetch the document only once.
        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Maintenance request not found' });
        }

        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this request.' });
        }

        if (req.user.role === 'Tenant') {
            const allowedUpdates = ['description', 'notes'];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every(update => allowedUpdates.includes(update));
            if (!isValidOperation) {
                return res.status(403).json({ success: false, message: 'Tenants can only update description and notes.' });
            }
        }

        // REFACTOR: Apply updates to the fetched document and then save it.
        Object.assign(request, req.body);
        const updatedRequest = await request.save();

        auditService.recordAction(req.user._id, req.user.organizationId, 'MAINTENANCE_REQUEST_UPDATED', {
            requestId: updatedRequest._id.toString(),
            status: updatedRequest.status,
            description: updatedRequest.description,
        });

        res.status(200).json({ success: true, data: updatedRequest });
    } catch (error: any) {
        console.error("Error updating maintenance request:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export const deleteMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Maintenance request not found' });
        }

        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this request.' });
        }

        if (!['Landlord', 'Agent', 'Super Admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Your role is not authorized to delete maintenance requests.' });
        }

        await request.deleteOne();

        auditService.recordAction(req.user._id, req.user.organizationId, 'MAINTENANCE_REQUEST_DELETED', {
            requestId: request._id.toString(),
            description: request.description,
        });

        res.status(200).json({ success: true, message: 'Maintenance request deleted successfully.' });
    } catch (error: any) {
        console.error("Error deleting maintenance request:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
