// backend/routes/orgRoutes.ts
import { Router } from 'express';
// CORRECTED: Import the necessary controller functions from orgController
import {
    getOrganizationDetails,
    listOrganizations, // CORRECTED: Ensure this is imported
    setOrgStatus // CORRECTED: Ensure this is imported
} from '../controllers/orgController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';
import { orgContext } from '../middleware/orgContext'; // Assuming you want orgContext middleware

const router = Router();

// FIX: Apply protect and authorize middleware as needed for org routes
router.use(protect); // All org routes should be protected

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

export default router;
