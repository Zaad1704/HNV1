import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'; // Ensure this is imported if used
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

export const getTenants = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    const tenants = await Tenant.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name');
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createTenant = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
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
            tenantId: tenant._id.toString(),
            tenantName: tenant.name,
            propertyId: property._id.toString()
        }
    );
    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTenantById = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
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

// --- MODIFIED FUNCTION ---
export const updateTenant = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this tenant' });
    }

    // NEW: Allow updating discountAmount and discountExpiresAt
    const { discountAmount, discountExpiresAt, ...otherUpdates } = req.body;

    const updates: any = { ...otherUpdates };
    if (discountAmount !== undefined) {
        updates.discountAmount = discountAmount;
    }
    if (discountExpiresAt !== undefined) {
        updates.discountExpiresAt = discountExpiresAt ? new Date(discountExpiresAt) : null; // Convert to Date or null
    } else if (discountAmount === 0) { // If discount is set to 0, clear expiry
        updates.discountExpiresAt = null;
    }
    
    tenant = await Tenant.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (tenant) {
        auditService.recordAction(
            req.user._id,
            req.user.organizationId,
            'TENANT_UPDATE',
            { 
                tenantId: tenant._id.toString(), 
                tenantName: tenant.name,
                // Add discount details to audit log if they were updated
                ...(discountAmount !== undefined && { discountAmount: tenant.discountAmount }),
                ...(discountExpiresAt !== undefined && { discountExpiresAt: tenant.discountExpiresAt })
            }
        );
    }
    res.status(200).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTenant = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
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
        { tenantId: tenant._id.toString(), tenantName: tenant.name }
    );
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
