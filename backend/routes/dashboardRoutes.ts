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

router.get('/', getOverviewStats);
router.get('/financial', getFinancialSummary);
router.get('/occupancy', getOccupancySummary);

export default router;
