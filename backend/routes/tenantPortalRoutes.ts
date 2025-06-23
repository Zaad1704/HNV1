import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getTenantDashboardData } from '../controllers/tenantPortalController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

router.get('/dashboard', protect, authorize(['Tenant']), asyncHandler(getTenantDashboardData));

export default router;
