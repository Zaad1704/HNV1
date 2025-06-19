// backend/routes/dashboardRoutes.ts
import { Router } from 'express';
import {
  getOverviewStats,
  getFinancialSummary,
  getOccupancySummary
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/overview-stats', getOverviewStats);
router.get('/financial-summary', getFinancialSummary);
router.get('/occupancy-summary', getOccupancySummary);
router.get('/expiring-leases', (req, res) => res.json({success: true, data:[]})); // Placeholder for another frontend call
router.get('/late-tenants', (req, res) => res.json({success: true, data:[]})); // Placeholder for another frontend call

export default router;
