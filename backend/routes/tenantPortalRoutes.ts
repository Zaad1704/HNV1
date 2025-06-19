import { Router } from 'express';
import { getTenantDashboardData } from '../controllers/tenantPortalController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.get('/dashboard', protect, authorize(['Tenant']), getTenantDashboardData);

export default router;
