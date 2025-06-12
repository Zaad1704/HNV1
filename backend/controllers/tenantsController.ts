import { Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';

/**
 * @desc    Get all tenants for the user's organization
 * @route   GET /api/tenants
 * @access  Private
 */
export const getTenants = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Find all tenants that belong to the logged-in user's organization
    // Also, populate the 'name' of the property they are assigned to for easier display on the frontend.
    const tenants = await Tenant.find({ organizationId: req.user!.organizationId })
      .populate('propertyId', 'name');
      
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a new tenant
 * @route   POST /api/tenants
 * @access  Private
 */
export const createTenant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId } = req.body;

    // Security Check: Before creating a tenant, ensure the property they are being assigned to
    // actually belongs to the user's organization.
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user!.organizationId.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid property selected.' });
    }

    const tenantData = {
      ...req.body,
      organizationId: req.user!.organizationId,
    };

    const tenant = await Tenant.create(tenantData);

    // Record this action
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'TENANT_CREATE', { 
      tenantId: tenant._id.toString(), 
      tenantName: tenant.name,
      propertyId: property._id.toString()
    });

    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a single tenant by their ID
 * @route   GET /api/tenants/:id
 * @access  Private
 */
export const getTenantById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }
    
    // Security Check
    if (tenant.organizationId.toString() !== req.user!.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to access this tenant' });
    }

    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update a tenant's information
 * @route   PUT /api/tenants/:id
 * @access  Private
 */
export const updateTenant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Security Check
    if (tenant.organizationId.toString() !== req.user!.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this tenant' });
    }

    tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'TENANT_UPDATE', { tenantId: tenant!._id.toString(), tenantName: tenant!.name });

    res.status(200).json({ success: true, data: tenant });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a tenant
 * @route   DELETE /api/tenants/:id
 * @access  Private
 */
export const deleteTenant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Security Check
    if (tenant.organizationId.toString() !== req.user!.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this tenant' });
    }

    await tenant.deleteOne();
    
    auditService.recordAction(req.user!._id, req.user!.organizationId, 'TENANT_DELETE', { tenantId: tenant._id.toString(), tenantName: tenant.name });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
