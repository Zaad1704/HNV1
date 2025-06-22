// backend/controllers/maintenanceController.ts
import { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';
import auditService from '../services/auditService';
import notificationService from '../services/notificationService';
import mongoose from 'mongoose';

export const createMaintenanceRequest = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }

    const { propertyId, description, priority } = req.body;
    try {
        const property = await Property.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Property not found or not authorized.' });
        }
        const newRequest = await MaintenanceRequest.create({ propertyId, description, priority, organizationId: req.user.organizationId, requestedBy: req.user._id });

        if (property.createdBy) {
            const message = `New maintenance request for ${property.name}: "${description.substring(0, 50)}..."`;
            await notificationService.createNotification(property.createdBy, req.user.organizationId, message, '/dashboard/maintenance');
        }
        
        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'MAINT_REQUEST_CREATE', { requestId: newRequest._id.toString() });
        res.status(201).json({ success: true, data: newRequest });
    } catch(err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getOrgMaintenanceRequests = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    try {
        const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name').populate('requestedBy', 'name');
        res.status(200).json({ success: true, data: requests });
    } catch(err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const getMaintenanceRequestById = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    try {
        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found or not authorized.' });
        }
        res.status(200).json({ success: true, data: request });
    } catch(err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateMaintenanceRequest = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const { status } = req.body;
    try {
        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found or not authorized.' });
        }
        const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'MAINT_REQUEST_UPDATE', { requestId: updatedRequest!._id.toString(), newStatus: status });
        res.status(200).json({ success: true, data: updatedRequest });
    } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const deleteMaintenanceRequest = async (req: Request, res: Response) => {
     if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    try {
        const request = await MaintenanceRequest.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found or not authorized.' });
        }
        await request.deleteOne();
        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'MAINT_REQUEST_DELETE', { requestId: request._id.toString() });
        res.status(200).json({ success: true, data: {} });
    } catch (err) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
