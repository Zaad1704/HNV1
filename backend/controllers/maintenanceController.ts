import { Request, Response, NextFunction } from 'express';
import MaintenanceRequest, { IMaintenanceRequest } from '../models/MaintenanceRequest';
import Property from '../models/Property';
import auditService from '../services/auditService';
import mongoose, { Types } from 'mongoose';

export const createMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { propertyId, description, status, priority, tenantId, category, notes, assignedTo } = req.body;

    if (!propertyId || !description) {
      res.status(400).json({ success: false, message: 'Property ID and description are required.' });
      return;
    }

    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to create requests for this property.' });
      return;
    }

    const newRequest = await MaintenanceRequest.create({
      organizationId: req.user.organizationId as Types.ObjectId,
      propertyId: new Types.ObjectId(propertyId),
      tenantId: tenantId ? new Types.ObjectId(tenantId) : undefined,
      description,
      status: status || 'Open',
      priority: priority || 'Medium',
      requestedBy: req.user._id as Types.ObjectId, 
      category,
      notes,
      assignedTo: assignedTo ? new Types.ObjectId(assignedTo) : undefined,
    });

    auditService.recordAction(
      req.user._id as Types.ObjectId,
      req.user.organizationId as Types.ObjectId,
      'MAINTENANCE_REQUEST_CREATED',
      { requestId: (newRequest._id as Types.ObjectId).toString(), description: newRequest.description, propertyId: (property._id as Types.ObjectId).toString() }
    );

    res.status(201).json({ success: true, data: newRequest });

  } catch (error: any) {
    console.error("Error creating maintenance request:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getOrgMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId })
      .populate('propertyId', 'name address') 
      .populate('requestedBy', 'name email') 
      .populate('assignedTo', 'name email') 
      .populate('tenantId', 'name email') 
      .sort({ createdAt: -1 }); 

    res.status(200).json({ success: true, count: requests.length, data: requests });

  } catch (error: any) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const getMaintenanceRequestById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('propertyId', 'name address')
      .populate('requestedBy', 'name email') 
      .populate('assignedTo', 'name email')
      .populate('tenantId', 'name email');

    if (!request) {
      res.status(404).json({ success: false, message: 'Maintenance request not found' });
      return;
    }

    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to access this request.' });
      return;
    }

    if (req.user.role === 'Tenant' && (request.requestedBy as any)?._id?.toString() !== req.user._id.toString()) {
        res.status(403).json({ success: false, message: 'Tenants can only view their own reported requests.' });
        return;
    }

    res.status(200).json({ success: true, data: request });

  } catch (error: any) {
    console.error("Error fetching maintenance request by ID:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const updateMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    let request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      res.status(404).json({ success: false, message: 'Maintenance request not found' });
      return;
    }

    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this request.' });
      return;
    }

    if (req.user.role === 'Tenant') {
        const allowedUpdates = ['description', 'notes'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            res.status(403).json({ success: false, message: 'Tenants can only update description and notes.' });
            return;
        }
    }

    request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });

    if (request) {
        auditService.recordAction(
            req.user._id as Types.ObjectId,
            req.user.organizationId as Types.ObjectId,
            'MAINTENANCE_REQUEST_UPDATED',
            { requestId: (request._id as Types.ObjectId).toString(), status: request.status, description: request.description }
        );
    }

    res.status(200).json({ success: true, data: request });

  } catch (error: any) {
    console.error("Error updating maintenance request:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

export const deleteMaintenanceRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      res.status(404).json({ success: false, message: 'Maintenance request not found' });
      return;
    }

    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this request.' });
      return;
    }

    if (!['Landlord', 'Agent', 'Super Admin'].includes(req.user.role)) {
        res.status(403).json({ success: false, message: 'Your role is not authorized to delete maintenance requests.' });
        return;
    }

    await request.deleteOne();

    auditService.recordAction(
      req.user._id as Types.ObjectId,
      req.user.organizationId as Types.ObjectId,
      'MAINTENANCE_REQUEST_DELETED',
      { requestId: (request._id as Types.ObjectId).toString(), description: request.description }
    );

    res.status(200).json({ success: true, message: 'Maintenance request deleted successfully.' });

  } catch (error: any) {
    console.error("Error deleting maintenance request:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
