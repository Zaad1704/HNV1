import { Router } from 'express';
import { getOverviewStats, getLateTenants, getFinancialSummary, getOccupancySummary } from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/overview-stats', protect, authorize('Landlord', 'Agent', 'Super Admin'), getOverviewStats);
router.get('/late-tenants', protect, authorize('Landlord', 'Agent'), getLateTenants);
router.get('/financial-summary', protect, authorize('Landlord', 'Agent'), getFinancialSummary);
router.get('/occupancy-summary', protect, authorize('Landlord', 'Agent'), getOccupancySummary); // <-- NEW ROUTE

export default router;
