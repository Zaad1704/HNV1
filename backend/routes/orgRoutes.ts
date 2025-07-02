// backend/routes/orgRoutes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
    getOrganizationDetails,
    listOrganizations,
    setOrgStatus
} from '../controllers/orgController'; 
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Apply protect middleware to all routes in this file
// Routes are protected by app.ts middleware

// @route   GET /api/orgs/me
// @desc    Get details for the logged-in user's organization
// @access  Private (Landlord, Agent, Tenant - depending on what details are shared)
router.get('/me', asyncHandler(getOrganizationDetails));

// @route   GET /api/orgs
// @desc    List all organizations (Super Admin only)
// @access  Private (Super Admin)
router.get('/', authorize(['Super Admin']), asyncHandler(listOrganizations));

// @route   PUT /api/orgs/:id/status
// @desc    Set organization status (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/status', authorize(['Super Admin']), asyncHandler(setOrgStatus));

export default router;
