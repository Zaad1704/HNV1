import { Router } from 'express';
import { getTenantDashboardData } from '../controllers/tenantPortalController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This route is protected and only available to users with the 'Tenant' role.
router.get('/dashboard', protect, authorize('Tenant'), getTenantDashboardData);

export default router;
