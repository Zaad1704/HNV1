// backend/routes/dashboardRoutes.ts
import express from 'express';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
  getFinancialSummary, // <-- Import new function
  getOccupancySummary, // <-- Import new function
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = express.Router();
router.use(protect, authorize(['Super Admin', 'Landlord', 'Agent']));

router.get('/overview-stats', getOverviewStats);
router.get('/late-tenants', getLateTenants);
router.get('/expiring-leases', getExpiringLeases);

// --- NEW ROUTES FOR CHARTS ---
router.get('/financial-summary', getFinancialSummary);
router.get('/occupancy-summary', getOccupancySummary);

export default router;
