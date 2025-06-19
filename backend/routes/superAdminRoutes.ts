import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations, 
    updateSubscriptionStatus,
    getPlatformGrowthData,
    getPlanDistributionData,
    getAllUsers,
    getBillingData,
    createModerator,
    getModerators,
    updateModerator,
    updateUserStatus,
    grantLifetimeAccess
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// This middleware ensures only Super Admins can access these routes
router.use(protect, authorize(['Super Admin']));

// Platform-Wide Stats & Reporting Routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/platform-growth', getPlatformGrowthData);
router.get('/plan-distribution', getPlanDistributionData);
router.get('/billing', getBillingData);

// Organization & User Management Routes
router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/subscription', updateSubscriptionStatus);
router.put('/organizations/:id/grant-lifetime', grantLifetimeAccess);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Moderator Management Routes
router.route('/moderators')
    .post(createModerator)
    .get(getModerators);

router.route('/moderators/:id')
    .put(updateModerator);

export default router;
