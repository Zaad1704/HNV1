// backend/routes/superAdminRoutes.ts
import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations,
    getAllUsers,
    grantLifetimeAccess,
    revokeLifetimeAccess,
    updateUserByAdmin,
    getModerators,
    getGlobalBilling,
    updateSubscriptionStatus,
    getAllMaintenanceRequests // FIX: Import new function
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', getDashboardStats);

router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/status', updateSubscriptionStatus);
router.put('/organizations/:id/grant-lifetime', grantLifetimeAccess); // FIX: Add route for lifetime access
router.put('/organizations/:id/revoke-lifetime', revokeLifetimeAccess); // FIX: Add route for revoke lifetime access

router.get('/users', getAllUsers);
router.put('/users/:userId/manage', updateUserByAdmin);

router.get('/moderators', getModerators);
router.get('/billing', getGlobalBilling);

// FIX: Add route for platform-wide maintenance requests
router.get('/all-maintenance-requests', getAllMaintenanceRequests); 

export default router;
