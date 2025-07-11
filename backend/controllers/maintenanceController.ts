import { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';

interface AuthRequest extends Request {
  user?: any;
}

export const createMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyId, tenantId, description, priority, category } = req.body;

    if (!propertyId || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property ID and description are required' 
      });
    }

    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid property' 
      });
    }

    const newRequest = await MaintenanceRequest.create({
      organizationId: req.user.organizationId,
      propertyId,
      tenantId,
      description,
      status: 'Open',
      priority: priority || 'Medium',
      category,
      requestedBy: req.user._id
    });

    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMaintenanceRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId, propertyId, status } = req.query;
    const filter: any = { organizationId: req.user.organizationId };
    
    if (tenantId) filter.tenantId = tenantId;
    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;

    const requests = await MaintenanceRequest.find(filter)
      .populate('propertyId', 'name address')
      .populate('tenantId', 'name unit')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const updatedRequest = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    await request.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};