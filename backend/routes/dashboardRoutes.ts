// backend/routes/dashboardRoutes.ts

import express from 'express';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = express.Router();

// All dashboard routes should be protected
router.use(protect, authorize(['Super Admin', 'Landlord', 'Agent']));

router.get('/overview-stats', getOverviewStats);
router.get('/late-tenants', getLateTenants);
router.get('/expiring-leases', getExpiringLeases);

export default router;
