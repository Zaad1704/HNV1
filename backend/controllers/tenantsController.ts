import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import auditService from '../services/auditService';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; 

export const getTenants = async (req: AuthenticatedRequest, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const tenants = await Tenant.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name');
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createTenant = async (req: AuthenticatedRequest, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const { propertyId } = req.body;
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid property selected.' });
    }
    const tenantData = { ...req.body, organizationId: req.user.organizationId };
    const tenant = await Tenant.create(tenantData);
    
    auditService.recordAction(
        req.user._id,
        req.user.organizationId,
        'TENANT_CREATE',
        {
            tenantId: (tenant._id as mongoose.Types.ObjectId).toString(), // Fix: Cast to ObjectId
            tenantName: tenant.name,
            propertyId: (property._id as mongoose.Types.ObjectId).toString() // Fix: Cast to ObjectId
        }
    );
    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTenantById = async (req: AuthenticatedRequest, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to access this tenant' });
    }
    res.status(200).json({ success: true, data: tenant });
  }
   catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateTenant = async (req: AuthenticatedRequest, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const originalTenant = await Tenant.findById(req.params.id).lean();
    if (!originalTenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    
    if (originalTenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this tenant' });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (updatedTenant) {
        const changes = {};
        for (const key in req.body) {
            // FIX: Ensure comparison is safe, accessing properties with string index signature
            if ((originalTenant as any)[key] !== (updatedTenant as any)[key]) {
                (changes as any)[key] = {
                    from: (originalTenant as any)[key] || 'undefined',
                    to: (updatedTenant as any)[key]
                };
            }
        }

        auditService.recordAction(
            req.user._id,
            req.user.organizationId,
            'TENANT_UPDATE',
            { 
                tenantId: (updatedTenant._id as mongoose.Types.ObjectId).toString(), // Fix: Cast to ObjectId
                tenantName: updatedTenant.name,
                ...(Object.keys(changes).length > 0 && { changes })
            }
        );
    }
    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTenant = async (req: AuthenticatedRequest, res: Response) => { 
  try {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this tenant' });
    }
    await tenant.deleteOne();
    
    auditService.recordAction(
        req.user._id,
        req.user.organizationId,
        'TENANT_DELETE',
        { tenantId: (tenant._id as mongoose.Types.ObjectId).toString(), tenantName: tenant.name } // Fix: Cast to ObjectId
    );
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
