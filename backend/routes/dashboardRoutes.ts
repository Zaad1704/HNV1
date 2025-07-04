import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
  getFinancialSummary,
  getRentStatus,
  getStats
} from '../controllers/dashboardController';

const router = Router();

router.use(protect);

router.get('/overview', getOverviewStats);
router.get('/overview-stats', getOverviewStats);
router.get('/late-tenants', getLateTenants);
router.get('/expiring-leases', getExpiringLeases);
router.get('/financial-summary', getFinancialSummary);
router.get('/rent-status', getRentStatus);
router.get('/stats', getStats);

export default router;
