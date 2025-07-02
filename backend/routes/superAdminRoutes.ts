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
    deleteOrganization,
    updateSiteContent,
    createPlan,
    updatePlan,
    deletePlan
} from '../controllers/superAdminController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Super Admin Route: ${req.method} ${req.originalUrl}`);
  console.log('User:', req.user?.role);
  next();
});

// Test route without auth
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Super admin routes working', timestamp: new Date() });
});

router.use(protect, authorize(['Super Admin', 'Super Moderator']));

router.get('/dashboard-stats', async (req: Request, res: Response) => {
  try {
    const User = require('../models/User');
    const Organization = require('../models/Organization');
    const Subscription = require('../models/Subscription');
    
    const totalUsers = await User.countDocuments();
    const totalOrgs = await Organization.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    res.json({ success: true, data: { totalUsers, totalOrgs, activeSubscriptions } });
  } catch (error) {
    res.json({ success: true, data: { totalUsers: 0, totalOrgs: 0, activeSubscriptions: 0 } });
  }
});

router.get('/platform-growth', async (req: Request, res: Response) => {
  const mockData = [
    { name: 'Jan', 'New Users': 12, 'New Organizations': 5 },
    { name: 'Feb', 'New Users': 19, 'New Organizations': 8 },
    { name: 'Mar', 'New Users': 15, 'New Organizations': 6 },
    { name: 'Apr', 'New Users': 22, 'New Organizations': 9 },
    { name: 'May', 'New Users': 18, 'New Organizations': 7 },
    { name: 'Jun', 'New Users': 25, 'New Organizations': 10 }
  ];
  res.json({ success: true, data: mockData });
});

router.get('/plan-distribution', async (req: Request, res: Response) => {
  const mockData = [
    { name: 'Starter', value: 45 },
    { name: 'Professional', value: 35 },
    { name: 'Enterprise', value: 20 }
  ];
  res.json({ success: true, data: mockData });
});

router.get('/organizations', async (req: Request, res: Response) => {
  try {
    console.log('Fetching organizations...');
    const Organization = require('../models/Organization');
    const organizations = await Organization.find({}).populate('owner', 'name email');
    console.log('Found organizations:', organizations.length);
    res.json({ success: true, data: organizations || [] });
  } catch (error) {
    console.error('Organizations fetch error:', error);
    res.json({ success: true, data: [] });
  }
});
router.put('/organizations/:id/status', asyncHandler(updateSubscriptionStatus));
router.patch('/organizations/:id/activate', asyncHandler(async (req: Request, res: Response) => {
  const Subscription = require('../models/Subscription');
  const subscription = await Subscription.findOneAndUpdate(
    { organizationId: req.params.id },
    { status: 'active' },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: subscription });
}));

router.patch('/organizations/:id/deactivate', asyncHandler(async (req: Request, res: Response) => {
  const Subscription = require('../models/Subscription');
  const subscription = await Subscription.findOneAndUpdate(
    { organizationId: req.params.id },
    { status: 'inactive' },
    { new: true }
  );
  res.json({ success: true, data: subscription });
}));

router.patch('/organizations/:id/grant-lifetime', asyncHandler(grantLifetimeAccess));
router.patch('/organizations/:id/revoke-lifetime', asyncHandler(revokeLifetimeAccess));
router.delete('/organizations/:orgId', asyncHandler(deleteOrganization)); // New Route

router.put('/organizations/:orgId/subscription', asyncHandler(updateOrganizationSubscription)); 
router.put('/organizations/:orgId/toggle-self-deletion', asyncHandler(toggleSelfDeletion)); 

router.get('/users', async (req: Request, res: Response) => {
  try {
    console.log('Fetching users...');
    const User = require('../models/User');
    const users = await User.find({}).populate('organizationId', 'name');
    console.log('Found users:', users.length);
    res.json({ success: true, data: users || [] });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.json({ success: true, data: [] });
  }
});
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
    isEmailVerified: true,
    status: 'active'
  });
  res.status(201).json({ success: true, data: user });
}));

router.get('/moderators', asyncHandler(getModerators));

router.put('/moderators/:id', asyncHandler(async (req: Request, res: Response) => {
  const { name, email, status } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, status: status === 'active' ? 'active' : 'suspended' },
    { new: true }
  );
  if (!user) {
    res.status(404).json({ success: false, message: 'Moderator not found' });
    return;
  }
  res.json({ success: true, data: user });
}));

router.delete('/moderators/:id', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'Moderator not found' });
    return;
  }
  res.json({ success: true, message: 'Moderator removed successfully' });
}));
router.get('/billing', async (req: Request, res: Response) => {
  const mockData = {
    totalRevenue: 125430,
    monthlyRevenue: 18750,
    activeSubscriptions: 342,
    churnRate: 2.3,
    recentTransactions: [],
    revenueChart: [
      { month: 'Jan', revenue: 12000, subscriptions: 45 },
      { month: 'Feb', revenue: 15000, subscriptions: 52 },
      { month: 'Mar', revenue: 18000, subscriptions: 58 }
    ]
  };
  res.json({ success: true, data: mockData });
});

// Plan management routes
router.get('/plans', async (req: Request, res: Response) => {
  try {
    console.log('Fetching plans...');
    const Plan = require('../models/Plan');
    const plans = await Plan.find({}).sort({ price: 1 });
    console.log('Found plans:', plans.length);
    res.json({ success: true, data: plans || [] });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.json({ success: true, data: [] });
  }
});

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

// Content management routes
router.put('/site-content/:section', asyncHandler(updateSiteContent));

// Enhanced plan management
router.post('/plans-enhanced', asyncHandler(createPlan));
router.put('/plans-enhanced/:planId', asyncHandler(updatePlan));
router.delete('/plans-enhanced/:planId', asyncHandler(deletePlan));

export default router;
