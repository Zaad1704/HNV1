import { Router } from 'express';
import {
  getDashboardStats,
  getPlanDistribution,
  getPlatformGrowth,
  getEmailStatus,
  getOrganizations,
  deleteOrganization,
  getUsers,
  deleteUser,
  updateUserPlan,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  activatePlan,
  getModerators,
  createModerator,
  updateModerator,
  deleteModerator,
  updateSiteSettings,
  updateSiteContent,
  uploadImage,
  getBilling
} from '../controllers/superAdminController';

const router = Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/plan-distribution', getPlanDistribution);
router.get('/platform-growth', getPlatformGrowth);
router.get('/email-status', getEmailStatus);
router.get('/organizations', getOrganizations);
router.delete('/organizations/:orgId', deleteOrganization);
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/plan', updateUserPlan);
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);
router.delete('/plans/:id', deletePlan);
router.put('/plans/:id/activate', activatePlan);
router.get('/moderators', getModerators);
router.post('/moderators', createModerator);
router.put('/moderators/:id', updateModerator);
router.delete('/moderators/:id', deleteModerator);
router.put('/site-settings', updateSiteSettings);
router.put('/site-content/:section', updateSiteContent);
router.post('/upload-image', uploadImage);
router.get('/billing', getBilling);

export default router;
