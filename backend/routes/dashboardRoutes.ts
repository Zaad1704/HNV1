import { Router } from 'express';
import { getOverviewStats } from '../controllers/dashboardController';
// Add other controller imports here as we build more features
// e.g., import { getLateTenants, getFinancialSummary } from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/overview-stats', protect, authorize('Landlord', 'Agent', 'Super Admin'), getOverviewStats);

// Other routes will be added here later
// router.get('/late-tenants', protect, authorize('Landlord', 'Agent'), getLateTenants);
// router.get('/financial-summary', protect, authorize('Landlord', 'Agent'), getFinancialSummary);

export default router;
