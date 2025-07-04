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
import { protect, authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

// Apply protection and authorization to all routes
router.use(protect);
router.use(authorize('Super Admin', 'Super Moderator'));

// Dashboard routes
router.get('/dashboard-stats', getDashboardStats);
router.get('/plan-distribution', getPlanDistribution);
router.get('/platform-growth', getPlatformGrowth);
router.get('/email-status', getEmailStatus);

// Organization management
router.get('/organizations', getOrganizations);
router.delete('/organizations/:orgId', authorize('Super Admin'), deleteOrganization);
router.patch('/organizations/:orgId/activate', activateOrganization);
router.patch('/organizations/:orgId/deactivate', deactivateOrganization);
router.patch('/organizations/:orgId/grant-lifetime', authorize('Super Admin'), grantLifetime);
router.patch('/organizations/:orgId/revoke-lifetime', authorize('Super Admin'), revokeLifetime);

// User management
router.get('/users', getUsers);
router.delete('/users/:userId', authorize('Super Admin'), deleteUser);
router.put('/users/:userId/plan', updateUserPlan);

// Plan management
router.get('/plans', getPlans);
router.post('/plans', authorize('Super Admin'), createPlan);
router.put('/plans/:id', authorize('Super Admin'), updatePlan);
router.delete('/plans/:id', authorize('Super Admin'), deletePlan);
router.put('/plans/:id/activate', authorize('Super Admin'), activatePlan);

// Moderator management
router.get('/moderators', authorize('Super Admin'), getModerators);
router.post('/moderators', authorize('Super Admin'), createModerator);
router.put('/moderators/:id', authorize('Super Admin'), updateModerator);
router.delete('/moderators/:id', authorize('Super Admin'), deleteModerator);

// Site management
router.put('/site-settings', authorize('Super Admin'), updateSiteSettings);
router.put('/site-content/:section', authorize('Super Admin'), updateSiteContent);
router.post('/upload-image', authorize('Super Admin'), upload.single('image'), uploadImage);

// Billing
router.get('/billing', getBilling);

// Settings
router.get('/settings', (req: any, res) => {
  res.json({ success: true, data: { role: req.user?.role, name: req.user?.name } });
});

export default router;
