import { Router } from 'express';
import {
    getOverviewStats,
    getLateTenants,
    getFinancialSummary,
    getOccupancySummary
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

router.get('/stats', getOverviewStats);
router.get('/late-tenants', getLateTenants);
router.get('/financial-summary', getFinancialSummary);
router.get('/occupancy-summary', getOccupancySummary);

export default router;
