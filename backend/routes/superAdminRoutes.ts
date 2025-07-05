import { Router } from 'express';
import {
  getDashboardStats,
  getPlanDistribution,
  getPlatformGrowth,
  getEmailStatus,
  getOrganizations,
  deleteOrganization,
  activateOrganization,
  deactivateOrganization,
  grantLifetime,
  revokeLifetime,
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
import { authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Note: Individual routes will check authorization as needed

router.get('/dashboard-stats', getDashboardStats);
router.get('/plan-distribution', getPlanDistribution);
router.get('/platform-growth', getPlatformGrowth);
router.get('/email-status', getEmailStatus);
router.get('/organizations', getOrganizations);
router.delete('/organizations/:orgId', deleteOrganization);
router.patch('/organizations/:orgId/activate', activateOrganization);
router.patch('/organizations/:orgId/deactivate', deactivateOrganization);
router.patch('/organizations/:orgId/grant-lifetime', grantLifetime);
router.patch('/organizations/:orgId/revoke-lifetime', revokeLifetime);
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/plan', updateUserPlan);
router.get('/plans', authorize('Super Admin', 'Super Moderator'), getPlans);
router.post('/plans', authorize('Super Admin'), createPlan);
router.put('/plans/:id', authorize('Super Admin'), updatePlan);
router.delete('/plans/:id', authorize('Super Admin'), deletePlan);
router.put('/plans/:id/activate', activatePlan);
router.get('/moderators', getModerators);
router.post('/moderators', createModerator);
router.put('/moderators/:id', updateModerator);
router.delete('/moderators/:id', deleteModerator);
router.put('/site-settings', updateSiteSettings);
router.put('/site-content/:section', updateSiteContent);
router.post('/upload-image', upload.single('image'), uploadImage);
router.get('/billing', getBilling);
router.get('/settings', authorize('Super Admin', 'Super Moderator'), (req: any, res) => {
  res.json({ success: true, data: { role: req.user?.role, name: req.user?.name } });
});

export default router;
