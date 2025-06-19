import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations, 
    updateOrganizationStatus,
    getPlatformGrowthData,
    getPlanDistributionData,
    getAllUsers,
    getBillingData,
    createModerator,
    getModerators,
    updateModerator,
    updateUserStatus
} from '../controllers/superAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This middleware protects all subsequent routes in this file for Super Admins only
router.use(protect, authorize('Super Admin'));

// --- Platform-Wide Stats & Reporting Routes ---
router.get('/dashboard-stats', authorize('can_view_reports'), getDashboardStats);
router.get('/platform-growth', authorize('can_view_reports'), getPlatformGrowthData);
router.get('/plan-distribution', authorize('can_view_reports'), getPlanDistributionData);
router.get('/billing', authorize('can_manage_billing'), getBillingData);

// --- Organization & User Management Routes ---
router.get('/organizations', authorize('can_manage_users'), getAllOrganizations);
router.put('/organizations/:id/status', authorize('can_manage_users'), updateOrganizationStatus);
router.get('/users', authorize('can_manage_users'), getAllUsers);
router.put('/users/:id/status', authorize('can_manage_users'), updateUserStatus);

// --- Moderator Management Routes (Super Admin Only) ---
router.route('/moderators')
    .post(createModerator)
    .get(getModerators);

router.route('/moderators/:id')
    .put(updateModerator);

// Note: The following routes are implicitly Super Admin only as they don't have
// a specific permission check, and the middleware at the top requires 'Super Admin'
// role for any un-permissioned route to pass. For clarity, you could add
// authorize('Super Admin') to them as well.
// router.get('/plans', ...);
// router.put('/site-editor', ...);

export default router;
