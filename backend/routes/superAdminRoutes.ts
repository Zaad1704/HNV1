// backend/routes/superAdminRoutes.ts
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

router.use(protect, authorize(['Super Admin', 'Super Moderator']));

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
    .post(authorize(['Super Admin']), createModerator) // Only SA can create
    .get(authorize(['Super Admin']), getModerators);

router.route('/moderators/:id')
    .put(authorize(['Super Admin']), updateModerator);

export default router;
