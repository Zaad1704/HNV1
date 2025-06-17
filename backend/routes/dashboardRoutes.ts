import { Router } from 'express';
import { getOverviewStats } from '../controllers/dashboardController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Protect this route and only allow Landlords/Agents/Super Admins
router.get('/overview-stats', protect, authorize('Landlord', 'Agent', 'Super Admin'), getOverviewStats);

export default router;
