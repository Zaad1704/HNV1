import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import actionChainService from '../services/actionChainService';

interface AuthRequest extends Request {
  user?: any;
}

export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Build query with optional propertyId filter
    const query: any = { organizationId: req.user.organizationId };
    if (req.query.propertyId) {
      query.propertyId = req.query.propertyId;
    }

    const tenants = await Tenant.find(query)
    .populate('propertyId', 'name')
    .lean()
    .exec() || [];

    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tenants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyId } = req.body;

    // Verify property if provided
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid property' 
        });
      }
    }

    // Handle image uploads
    const imageUrls: any = {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (files) {
      try {
        const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
        
        for (const [fieldname, fileArray] of Object.entries(files)) {
          if (fileArray && fileArray[0]) {
            const file = fileArray[0];
            if (isCloudinaryConfigured()) {
              imageUrls[fieldname] = await uploadToCloudinary(file, 'tenants');
            } else {
              imageUrls[fieldname] = `/uploads/images/${file.filename}`;
            }
          }
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    const tenantData = { 
      ...req.body, 
      ...imageUrls,
      organizationId: req.user.organizationId 
    };

    const tenant = await Tenant.create(tenantData);
    
    // Trigger action chain
    await actionChainService.onTenantAdded(tenant, req.user._id, req.user.organizationId);
    
    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTenantById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    await tenant.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};