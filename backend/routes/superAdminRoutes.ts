// backend/routes/superAdminRoutes.ts
import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations,
    getAllUsers,
    updateSubscriptionStatus, // ADDED THIS IMPORT
    grantLifetimeAccess,
    revokeLifetimeAccess,
    updateUserByAdmin,
    getModerators,
    getGlobalBilling,
    getAllMaintenanceRequests,
    getPlatformGrowth,
    getPlanDistribution
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', getDashboardStats);

// Add new routes for charts
router.get('/platform-growth', getPlatformGrowth);
router.get('/plan-distribution', getPlanDistribution);

router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/status', updateSubscriptionStatus);
router.put('/organizations/:id/grant-lifetime', grantLifetimeAccess);
router.put('/organizations/:id/revoke-lifetime', revokeLifetimeAccess);

router.get('/users', getAllUsers);
router.put('/users/:userId/manage', updateUserByAdmin);

router.get('/moderators', getModerators);
router.get('/billing', getGlobalBilling);

router.get('/all-maintenance-requests', getAllMaintenanceRequests);

export default router;
