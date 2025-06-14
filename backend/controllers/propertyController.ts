import { Response } from 'express';
import Property from '../models/Property';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';

export const getProperties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    const properties = await Property.find({ organizationId: req.user.organizationId });
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const propertyData = {
      ...req.body,
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
    };
    const property = await Property.create(propertyData);

    auditService.recordAction(req.user._id, req.user.organizationId, 'PROPERTY_CREATE', { 
      propertyId: property._id.toString(), 
      propertyName: property.name 
    });

    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPropertyById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    if (property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to access this property' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    if (property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    // FIX: Ensure property is not null before accessing its properties
    if (property) {
        auditService.recordAction(req.user._id, req.user.organizationId, 'PROPERTY_UPDATE', { propertyId: property._id.toString(), propertyName: property.name });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    if (property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this property' });
    }

    await property.deleteOne();
    
    auditService.recordAction(req.user._id, req.user.organizationId, 'PROPERTY_DELETE', { propertyId: property._id.toString(), propertyName: property.name });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
