// backend/routes/superAdminRoutes.ts
import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations,
    getAllUsers,
    grantLifetimeAccess,
    revokeLifetimeAccess,
    updateUserByAdmin,
    getModerators,      // <-- NEW
    getGlobalBilling    // <-- NEW
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', getDashboardStats);

router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/grant-lifetime', grantLifetimeAccess);
router.put('/organizations/:id/revoke-lifetime', revokeLifetimeAccess);

router.get('/users', getAllUsers);
router.put('/users/:userId/manage', updateUserByAdmin);

// NEW ROUTES
router.get('/moderators', getModerators);
router.get('/billing', getGlobalBilling);

export default router;
