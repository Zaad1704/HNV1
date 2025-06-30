// backend/routes/superAdminRoutes.ts
import { Router, Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from 'express-async-handler';
import { 
    getDashboardStats, 
    getAllOrganizations,
    getAllUsers,
    updateSubscriptionStatus,
    grantLifetimeAccess,
    revokeLifetimeAccess,
    updateUserByAdmin,
    getModerators,
    getGlobalBilling,
    getAllMaintenanceRequests,
    getPlatformGrowth,
    getPlanDistribution,
    updateOrganizationSubscription, 
    toggleSelfDeletion,
    deleteOrganization
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', asyncHandler(getDashboardStats));

router.get('/platform-growth', asyncHandler(getPlatformGrowth));
router.get('/plan-distribution', asyncHandler(getPlanDistribution));

router.get('/organizations', asyncHandler(getAllOrganizations));
router.put('/organizations/:id/status', asyncHandler(updateSubscriptionStatus));
router.put('/organizations/:id/grant-lifetime', asyncHandler(grantLifetimeAccess));
router.put('/organizations/:id/revoke-lifetime', asyncHandler(revokeLifetimeAccess));
router.post('/organizations/:id/grant-lifetime', asyncHandler(grantLifetimeAccess));
router.post('/organizations/:id/revoke-lifetime', asyncHandler(revokeLifetimeAccess));
router.delete('/organizations/:orgId', asyncHandler(deleteOrganization)); // New Route

router.put('/organizations/:orgId/subscription', asyncHandler(updateOrganizationSubscription)); 
router.put('/organizations/:orgId/toggle-self-deletion', asyncHandler(toggleSelfDeletion)); 

router.get('/users', asyncHandler(getAllUsers));
router.put('/users/:userId/manage', asyncHandler(updateUserByAdmin));
router.delete('/users/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, message: 'User deleted successfully' });
}));

router.post('/moderators', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email, 
    password,
    role: 'Super Moderator',
    organizationId: req.user?.organizationId,
    isEmailVerified: true
  });
  res.status(201).json({ success: true, data: user });
}));

router.get('/moderators', asyncHandler(getModerators));
router.get('/billing', asyncHandler(getGlobalBilling));

// Plan management routes
router.get('/plans', asyncHandler(async (req: Request, res: Response) => {
  const Plan = require('../models/Plan');
  const plans = await Plan.find({}).sort({ price: 1 });
  res.json({ success: true, data: plans });
}));

router.post('/plans', asyncHandler(async (req: Request, res: Response) => {
  const Plan = require('../models/Plan');
  const plan = await Plan.create(req.body);
  res.status(201).json({ success: true, data: plan });
}));

router.put('/plans/:id', asyncHandler(async (req: Request, res: Response) => {
  const Plan = require('../models/Plan');
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  res.json({ success: true, data: plan });
}));

router.delete('/plans/:id', asyncHandler(async (req: Request, res: Response) => {
  const Plan = require('../models/Plan');
  const plan = await Plan.findByIdAndDelete(req.params.id);
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  res.json({ success: true, message: 'Plan deleted successfully' });
}));

// User billing management
router.put('/users/:userId/plan', asyncHandler(async (req: Request, res: Response) => {
  const { planId } = req.body;
  const Subscription = require('../models/Subscription');
  const User = require('../models/User');
  
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  
  const subscription = await Subscription.findOneAndUpdate(
    { organizationId: user.organizationId },
    { planId, status: 'active' },
    { new: true, upsert: true }
  );
  
  res.json({ success: true, data: subscription });
}));

router.get('/all-maintenance-requests', asyncHandler(getAllMaintenanceRequests));

export default router;
