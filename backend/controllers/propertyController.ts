import { Request, Response } from 'express';
import Property from '../models/Property';
import actionChainService from '../services/actionChainService';
import { checkUsageLimit, updateUsageCount } from '../middleware/subscriptionMiddleware';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export const createProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  // Check usage limit before creating
  const subscriptionService = (await import('../services/subscriptionService')).default;
  const usageCheck = await subscriptionService.checkUsageLimit(user.organizationId, 'properties');
  
  if (!usageCheck.allowed) {
    res.status(403).json({
      success: false,
      message: 'Property limit exceeded',
      reason: usageCheck.reason,
      currentUsage: usageCheck.currentUsage,
      limit: usageCheck.limit
    });
    return;
  }

  try {
    const imageUrl = req.file ? req.file.imageUrl : undefined;
    const property = await Property.create({
      ...req.body,
      imageUrl: imageUrl,
      organizationId: user.organizationId,
      createdBy: user._id,
      managedByAgentId: req.body.managedByAgentId || null
    });

    // Trigger action chain
    await actionChainService.onPropertyAdded(property, user._id, user.organizationId);
    
    // Update usage count
    await subscriptionService.updateUsage(user.organizationId, 'properties', 1);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    let query: any = { organizationId: user.organizationId };
    
    // Agents see only properties they manage
    if (user.role === 'Agent') {
      // Get user's managed properties from User model
      const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
      const managedPropertyIds = userData?.managedProperties || [];
      
      query = {
        organizationId: user.organizationId,
        _id: { $in: managedPropertyIds }
      };
    }

    const properties = await Property.find(query)
      .populate('createdBy', 'name')
      .populate('managedByAgentId', 'name')
      .lean()
      .exec() || [];
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this property' });
      return;
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this property' });
      return;
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = req.file.imageUrl;
    }

    property = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
      return;
    }

    await property.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};