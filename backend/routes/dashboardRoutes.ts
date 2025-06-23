import express from 'express';
import asyncHandler from 'express-async-handler';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
  getFinancialSummary,
  getOccupancySummary,
  getRentStatus,       
  getRecentActivity,   
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = express.Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

router.get('/overview-stats', asyncHandler(getOverviewStats));
router.get('/late-tenants', asyncHandler(getLateTenants));
router.get('/expiring-leases', asyncHandler(getExpiringLeases));
router.get('/financial-summary', asyncHandler(getFinancialSummary));
router.get('/occupancy-summary', asyncHandler(getOccupancySummary));

// --- NEW ROUTES FOR OVERVIEW WIDGETS ---
router.get('/rent-status', asyncHandler(getRentStatus));
router.get('/recent-activity', asyncHandler(getRecentActivity));

export default router;
