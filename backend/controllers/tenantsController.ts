import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// getTenants, createTenant, getTenantById functions remain the same
export const getTenants = asyncHandler(async (req: Request, res: Response) => { /* ... */ });
export const createTenant = asyncHandler(async (req: Request, res: Response) => { /* ... */ });
export const getTenantById = asyncHandler(async (req: Request, res: Response) => { /* ... */ });

/**
 * @desc    Update a tenant's details
 * @route   PUT /api/tenants/:id
 * @access  Private
 */
export const updateTenant = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');
    }

    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }
    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(403);
        throw new Error('User not authorized to update this tenant');
    }

    // Combine all text-based fields from the request body into an updates object
    const updates = { ...req.body };

    // Handle any file uploads from the request
    if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        // Check for each possible image and add its URL to the updates object
        if (files.imageUrl?.[0]) {
            updates.imageUrl = (files.imageUrl[0] as any).imageUrl;
        }
        if (files.govtIdImageUrlFront?.[0]) {
            updates.govtIdImageUrlFront = (files.govtIdImageUrlFront[0] as any).imageUrl;
        }
        if (files.govtIdImageUrlBack?.[0]) {
            updates.govtIdImageUrlBack = (files.govtIdImageUrlBack[0] as any).imageUrl;
        }
    }

    // Find the tenant by ID and apply all updates at once
    const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, updates, {
        new: true, // Return the modified document rather than the original
        runValidators: true, // Ensure schema validation is run on update
    });

    // Record the action in the audit log
    auditService.recordAction(
        req.user._id,
        req.user.organizationId,
        'TENANT_UPDATE',
        { tenantId: tenant._id.toString(), tenantName: updatedTenant.name }
    );
    
    res.status(200).json({ success: true, data: updatedTenant });
});


export const deleteTenant = asyncHandler(async (req: Request, res: Response) => {
    // delete function remains the same
});
