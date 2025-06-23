import express from 'express';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
  getFinancialSummary,
  getOccupancySummary,
  getRentStatus,       // <-- Import new function
  getRecentActivity,   // <-- Import new function
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = express.Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

router.get('/overview-stats', getOverviewStats);
router.get('/late-tenants', getLateTenants);
router.get('/expiring-leases', getExpiringLeases);
router.get('/financial-summary', getFinancialSummary);
router.get('/occupancy-summary', getOccupancySummary);

// --- NEW ROUTES FOR OVERVIEW WIDGETS ---
router.get('/rent-status', getRentStatus);
router.get('/recent-activity', getRecentActivity);

export default router;
