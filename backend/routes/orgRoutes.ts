// backend/routes/orgRoutes.ts
import { Router } from 'express';
import {
    getOrganizationDetails,
    listOrganizations,
    setOrgStatus
} from '../controllers/orgController'; // Ensure these are correctly imported AND exported from orgController
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
// import { orgContext } from '../middleware/orgContext'; // Commented out if not directly used in this file's routes

const router = Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// @route   GET /api/orgs/me
// @desc    Get details for the logged-in user's organization
// @access  Private (Landlord, Agent, Tenant - depending on what details are shared)
router.get('/me', getOrganizationDetails);

// @route   GET /api/orgs
// @desc    List all organizations (Super Admin only)
// @access  Private (Super Admin)
router.get('/', authorize(['Super Admin']), listOrganizations);

// @route   PUT /api/orgs/:id/status
// @desc    Set organization status (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/status', authorize(['Super Admin']), setOrgStatus);

// You might also have routes for updating organization branding, inviting members, etc.
// Example:
// router.put('/me/branding', authorize(['Landlord']), updateOrgBranding);

export default router; // This line ensures the router is exported as the default
