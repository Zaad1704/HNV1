// routes/dashboardRoutes.ts
import express from 'express';
import {
  getOverviewStats,
  getFinancialSummary,
  getOccupancySummary
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

// The original file had a single '/' route. 
// The frontend calls specific routes, so we match those.
router.get('/overview-stats', getOverviewStats);
router.get('/financial-summary', getFinancialSummary);
router.get('/occupancy-summary', getOccupancySummary);

export default router;
