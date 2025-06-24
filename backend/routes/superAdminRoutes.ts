// backend/routes/superAdminRoutes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { 
    getDashboardStats, 
    getAllOrganizations,
    getAllUsers,
    updateSubscriptionStatus,
    grantLifetimeAccess,
    revokeLifetimeAccess,
    updateUserByAdmin,
    getModerators,
    getGlobalBilling,
    getAllMaintenanceRequests,
    getPlatformGrowth,
    getPlanDistribution,
    updateOrganizationSubscription, 
    toggleSelfDeletion,
    deleteUserByAdmin
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', asyncHandler(getDashboardStats));

router.get('/platform-growth', asyncHandler(getPlatformGrowth));
router.get('/plan-distribution', asyncHandler(getPlanDistribution));

router.get('/organizations', asyncHandler(getAllOrganizations));
router.put('/organizations/:id/status', asyncHandler(updateSubscriptionStatus));
router.put('/organizations/:id/grant-lifetime', asyncHandler(grantLifetimeAccess));
router.put('/organizations/:id/revoke-lifetime', asyncHandler(revokeLifetimeAccess));

router.put('/organizations/:orgId/subscription', asyncHandler(updateOrganizationSubscription)); 
router.put('/organizations/:orgId/toggle-self-deletion', asyncHandler(toggleSelfDeletion)); 

router.get('/users', asyncHandler(getAllUsers));
router.put('/users/:userId/manage', asyncHandler(updateUserByAdmin));
router.delete('/users/:userId', asyncHandler(deleteUserByAdmin)); // New Route

router.get('/moderators', asyncHandler(getModerators));
router.get('/billing', asyncHandler(getGlobalBilling));

router.get('/all-maintenance-requests', asyncHandler(getAllMaintenanceRequests));

export default router;
