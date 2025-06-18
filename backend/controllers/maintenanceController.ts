import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import MaintenanceRequest from '../models/MaintenanceRequest'; // Assuming this model exists
import Property from '../models/Property';
import auditService from '../services/auditService';

// This is a placeholder until you create the MaintenanceRequest model
// const MaintenanceRequest = mongoose.model('MaintenanceRequest', new mongoose.Schema({ name: String }));

export const createRequest = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { propertyId, description, priority } = req.body;
    try {
        const property = await Property.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Property not found or not authorized.' });
        }

        const newRequest = await MaintenanceRequest.create({
            propertyId,
            description,
            priority,
            organizationId: req.user.organizationId,
            requestedBy: req.user._id,
        });

        auditService.recordAction(req.user._id, req.user.organizationId, 'MAINT_REQUEST_CREATE', { 
            requestId: newRequest._id.toString(),
            propertyId: property._id.toString()
        });
        
        res.status(201).json({ success: true, data: newRequest });
    } catch(err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getRequests = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    try {
        const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name').populate('requestedBy', 'name');
        res.status(200).json({ success: true, data: requests });
    } catch(err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    const { status } = req.body;
    const { id } = req.params;

    try {
        const request = await MaintenanceRequest.findById(id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found or not authorized.' });
        }

        const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(id, { status }, { new: true });
        
        auditService.recordAction(req.user._id, req.user.organizationId, 'MAINT_REQUEST_UPDATE', {
            requestId: updatedRequest!._id.toString(),
            newStatus: status
        });

        res.status(200).json({ success: true, data: updatedRequest });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteRequest = async (req: AuthenticatedRequest, res: Response) => {
     if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { id } = req.params;
    try {
        const request = await MaintenanceRequest.findById(id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found or not authorized.' });
        }
        await request.deleteOne();
        auditService.recordAction(req.user._id, req.user.organizationId, 'MAINT_REQUEST_DELETE', { requestId: request._id.toString() });
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
