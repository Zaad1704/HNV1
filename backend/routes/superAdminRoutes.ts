import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations, 
    updateOrganizationStatus,
    getPlatformGrowthData,
    getPlanDistributionData,
    getAllUsers,
    getBillingData,
    // --- Import new functions ---
    createModerator,
    getModerators,
    updateModerator,
    updateUserStatus
} from '../controllers/superAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This middleware protects all subsequent routes in this file for Super Admins only
router.use(protect, authorize('Super Admin'));

// --- Existing Routes ---
// ... (keep all existing routes like /dashboard-stats, /organizations, /users, /billing, etc.)
router.get('/dashboard-stats', getDashboardStats);
router.get('/platform-growth', getPlatformGrowthData);
router.get('/plan-distribution', getPlanDistributionData);
router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/status', updateOrganizationStatus);
router.get('/users', getAllUsers);
router.get('/billing', getBillingData);


// --- NEW Moderator Management Routes ---
router.route('/moderators')
    .post(createModerator)
    .get(getModerators);

router.route('/moderators/:id')
    .put(updateModerator);


// --- NEW General User Management Route ---
router.route('/users/:id/status')
    .put(updateUserStatus);


export default router;
