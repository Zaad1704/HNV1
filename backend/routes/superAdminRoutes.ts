import { Router } from 'express';
import {
  getDashboardStats,
  getPlanDistribution,
  getPlatformGrowth,
  getEmailStatus,
  getOrganizations
} from '../controllers/superAdminController';

const router = Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/plan-distribution', getPlanDistribution);
router.get('/platform-growth', getPlatformGrowth);
router.get('/email-status', getEmailStatus);
router.get('/organizations', getOrganizations);

export default router;
