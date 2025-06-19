import { Router } from 'express';
import { getDashboardStats, getAllOrganizations, updateOrganizationStatus } from '../controllers/superAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This middleware protects all subsequent routes in this file
router.use(protect, authorize('Super Admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/status', updateOrganizationStatus);

export default router;
