// backend/controllers/maintenanceController.ts

import { Response, NextFunction } from 'express';
import MaintenanceRequest, { IMaintenanceRequest } from '../models/MaintenanceRequest';
import Property from '../models/Property';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';
import mongoose, { Types } from 'mongoose';

// @desc    Create a new maintenance request
// @route   POST /api/maintenance
// @access  Private (Landlord, Agent, Tenant - depending on allowed roles to create requests)
export const createMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyId, description, status, priority, tenantId, category, notes, assignedTo } = req.body;

    // Basic validation
    if (!propertyId || !description) {
      return res.status(400).json({ success: false, message: 'Property ID and description are required.' });
    }

    // Verify property belongs to the user's organization
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create requests for this property.' });
    }

    // Create the maintenance request
    const newRequest = await MaintenanceRequest.create({
      organizationId: req.user.organizationId as Types.ObjectId,
      propertyId: propertyId as Types.ObjectId,
      tenantId: tenantId ? (tenantId as Types.ObjectId) : undefined, // Cast if provided
      description,
      status: status || 'Open', // Default to 'Open' if not provided
      priority: priority || 'Medium', // Default to 'Medium'
      requestedBy: req.user._id as Types.ObjectId, // FIX: Use requestedBy to match model interface
      category,
      notes,
      assignedTo: assignedTo ? (assignedTo as Types.ObjectId) : undefined, // Cast if provided
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

// @desc    Get all maintenance requests for the user's organization
// @route   GET /api/maintenance
// @access  Private (Landlord, Agent, Super Admin)
export const getOrgMaintenanceRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const requests = await MaintenanceRequest.find({ organizationId: req.user.organizationId })
      .populate('propertyId', 'name address') // Populate property details
      .populate('requestedBy', 'name email') // Populate reporter details
      .populate('assignedTo', 'name email') // Populate assignee details
      .populate('tenantId', 'name email') // Populate tenant details
      .sort({ createdAt: -1 }); // Latest requests first

    res.status(200).json({ success: true, count: requests.length, data: requests });

  } catch (error: any) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single maintenance request by ID
// @route   GET /api/maintenance/:id
// @access  Private (Landlord, Agent, Super Admin, or Tenant if it's their request)
export const getMaintenanceRequestById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('propertyId', 'name address')
      .populate('requestedBy', 'name email') // Correctly populate 'requestedBy'
      .populate('assignedTo', 'name email')
      .populate('tenantId', 'name email');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Ensure user is authorized to view this request (belongs to their organization)
    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this request.' });
    }

    // Correctly access 'requestedBy'
    if (req.user.role === 'Tenant' && (request.requestedBy as any)?._id?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Tenants can only view their own reported requests.' });
    }

    res.status(200).json({ success: true, data: request });

  } catch (error: any) {
    console.error("Error fetching maintenance request by ID:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// @desc    Update a maintenance request
// @route   PUT /api/maintenance/:id
// @access  Private (Landlord, Agent, Super Admin)
export const updateMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Ensure user is authorized to update this request (belongs to their organization)
    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this request.' });
    }

    // Tenant role cannot update status or assignedTo directly, only description/notes
    if (req.user.role === 'Tenant') {
        const allowedUpdates = ['description', 'notes'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(403).json({ success: false, message: 'Tenants can only update description and notes.' });
        }
    }


    request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators on update
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

// @desc    Delete a maintenance request
// @route   DELETE /api/maintenance/:id
// @access  Private (Landlord, Agent, Super Admin - not Tenants)
export const deleteMaintenanceRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Ensure user is authorized to delete this request (belongs to their organization)
    if (request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this request.' });
    }

    // Only Landlords, Agents, Super Admins can delete requests
    if (!['Landlord', 'Agent', 'Super Admin'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Your role is not authorized to delete maintenance requests.' });
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
