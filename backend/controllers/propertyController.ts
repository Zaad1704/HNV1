import { Response } from 'express';
import Property from '../models/Property';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';

/**
 * @desc    Get all properties for the user's organization
 * @route   GET /api/properties
 * @access  Private
 */
export const getProperties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const properties = await Property.find({ organizationId: req.user!.organizationId });
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a new property
 * @route   POST /api/properties
 * @access  Private
 */
export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const propertyData = {
      ...req.body,
      organizationId: req.user!.organizationId,
      createdBy: req.user!.id,
    };
    const property = await Property.create(propertyData);

    // Record this action in the audit log
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'PROPERTY_CREATE', { 
      propertyId: property._id.toString(), 
      propertyName: property.name 
    });

    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a single property by its ID
 * @route   GET /api/properties/:id
 * @access  Private
 */
export const getPropertyById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    // Security Check: Ensure the property belongs to the user's organization
    if (property.organizationId.toString() !== req.user!.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to access this property' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a property
 * @route   PUT /api/properties/:id
 * @access  Private
 */
export const updateProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    // Security Check
    if (property.organizationId.toString() !== req.user!.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'PROPERTY_UPDATE', { propertyId: property!._id.toString(), propertyName: property!.name });

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a property
 * @route   DELETE /api/properties/:id
 * @access  Private
 */
export const deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    // Security Check
    if (property.organizationId.toString() !== req.user!.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this property' });
    }

    await property.deleteOne();
    
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'PROPERTY_DELETE', { propertyId: property._id.toString(), propertyName: property.name });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
