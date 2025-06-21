import { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';
import auditService from '../services/auditService';
import notificationService from '../services/notificationService'; // <-- Import notification service
import mongoose from 'mongoose';

// @desc    Create a new maintenance request
export const createMaintenanceRequest = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyId, description, priority } = req.body;
    try {
        const property = await Property.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Property not found or not authorized.' });
        }

        const newRequest = await MaintenanceRequest.create({
            propertyId: property._id,
            description,
            priority,
            organizationId: req.user.organizationId,
            requestedBy: req.user._id,
        });

        // --- NOTIFICATION LOGIC ADDED ---
        // Notify the user who created the property (the Landlord/owner)
        if (property.createdBy) {
            const message = `New maintenance request for ${property.name}: "${description.substring(0, 50)}..."`;
            const link = `/dashboard/maintenance`;
            await notificationService.createNotification(property.createdBy, req.user.organizationId, message, link);
        }
        // --- END OF NOTIFICATION LOGIC ---

        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'MAINT_REQUEST_CREATE', { 
            requestId: (newRequest._id as mongoose.Types.ObjectId).toString(), 
            propertyId: (property._id as mongoose.Types.ObjectId).toString() 
        });
        
        res.status(201).json({ success: true, data: newRequest });
    } catch(err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all maintenance requests for an organization
export const getOrgMaintenanceRequests = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    try {
        const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId })
            .populate('propertyId', 'name address')
            .populate('requestedBy', 'name');
        res.status(200).json({ success: true, data: requests });
    } catch(err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a maintenance request (e.g., change its status)
export const updateMaintenanceRequest = async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    
    const { status } = req.body;
    try {
        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found or not authorized.' });
        }

        const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'MAINT_REQUEST_UPDATE', {
            requestId: (updatedRequest!._id as mongoose.Types.ObjectId).toString(),
            newStatus: status
        });

        res.status(200).json({ success: true, data: updatedRequest });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ... other functions like getMaintenanceRequestById and deleteMaintenanceRequest
