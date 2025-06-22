// backend/routes/superAdminRoutes.ts
import { Router } from 'express';
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
    // NEW IMPORTS for A.1 and A.2
    updateOrganizationSubscription, 
    toggleSelfDeletion 
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', getDashboardStats);

router.get('/platform-growth', getPlatformGrowth);
router.get('/plan-distribution', getPlanDistribution);

router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/status', updateSubscriptionStatus);
router.put('/organizations/:id/grant-lifetime', grantLifetimeAccess);
router.put('/organizations/:id/revoke-lifetime', revokeLifetimeAccess);

// NEW ROUTE for A.1: Update an organization's subscription plan/status
router.put('/organizations/:orgId/subscription', updateOrganizationSubscription); 
// NEW ROUTE for A.2: Toggle self-service deletion
router.put('/organizations/:orgId/toggle-self-deletion', toggleSelfDeletion); 

router.get('/users', getAllUsers);
router.put('/users/:userId/manage', updateUserByAdmin);

router.get('/moderators', getModerators);
router.get('/billing', getGlobalBilling);

router.get('/all-maintenance-requests', getAllMaintenanceRequests);

export default router;
