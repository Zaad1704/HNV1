// backend/routes/superAdminRoutes.ts

import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations,
    getAllUsers,
    updateSubscriptionStatus,
    grantLifetimeAccess,
    revokeLifetimeAccess,
    updateUserByAdmin
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

// Dashboard
router.get('/dashboard-stats', getDashboardStats);

// Organizations
router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/subscription', updateSubscriptionStatus);
router.put('/organizations/:id/grant-lifetime', grantLifetimeAccess);
router.put('/organizations/:id/revoke-lifetime', revokeLifetimeAccess);

// Users
router.get('/users', getAllUsers);
router.put('/users/:userId/manage', updateUserByAdmin);

export default router;
