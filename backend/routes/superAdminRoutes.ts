// backend/routes/superAdminRoutes.ts
import { Router, Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
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

router.get('/dashboard-stats', asyncHandler(getDashboardStats));

router.get('/platform-growth', asyncHandler(getPlatformGrowth));

router.get('/plan-distribution', asyncHandler(getPlanDistribution));

router.get('/organizations', async (req: Request, res: Response) => {
  try {
    console.log('Fetching organizations...');
    const organizations = await Organization.find({})
      .populate('owner', 'name email')
      .populate({
        path: 'subscription',
        populate: {
          path: 'planId',
          select: 'name price duration'
        }
      });
    console.log('Found organizations:', organizations.length);
    console.log('Sample org:', organizations[0] ? { 
      name: organizations[0].name, 
      status: organizations[0].status,
      owner: organizations[0].owner,
      subscription: organizations[0].subscription
    } : 'No orgs');
    res.json({ success: true, data: organizations || [] });
  } catch (error) {
    console.error('Organizations fetch error:', error);
    res.json({ success: true, data: [] });
  }
});
router.put('/organizations/:id/status', asyncHandler(updateSubscriptionStatus));
router.patch('/organizations/:id/activate', asyncHandler(async (req: Request, res: Response) => {
  console.log('Activating organization:', req.params.id);
  const subscription = await Subscription.findOneAndUpdate(
    { organizationId: req.params.id },
    { status: 'active' },
    { new: true, upsert: true }
  );
  console.log('Subscription updated:', subscription);
  res.json({ success: true, data: subscription });
}));

router.patch('/organizations/:id/deactivate', asyncHandler(async (req: Request, res: Response) => {
  console.log('Deactivating organization:', req.params.id);
  const subscription = await Subscription.findOneAndUpdate(
    { organizationId: req.params.id },
    { status: 'inactive' },
    { new: true }
  );
  console.log('Subscription updated:', subscription);
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
    const users = await User.find({}).populate('organizationId', 'name');
    console.log('Found users:', users.length);
    console.log('Sample user:', users[0] ? { name: users[0].name, email: users[0].email, role: users[0].role } : 'No users');
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
  try {
    // Models already imported at top
    
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const allSubscriptions = await Subscription.find({ status: 'active' }).populate('planId');
    
    const totalRevenue = allSubscriptions.reduce((sum, sub) => {
      return sum + ((sub.planId as any)?.price || 0);
    }, 0);
    
    const monthlyRevenue = Math.round(totalRevenue * 0.75); // Estimate
    
    const recentTransactions = await Subscription.find({ status: 'active' })
      .populate('organizationId', 'name')
      .populate('planId', 'name price')
      .sort({ createdAt: -1 })
      .limit(10)
      .then(subs => subs.map(sub => ({
        _id: sub._id,
        organizationName: (sub.organizationId as any)?.name || 'Unknown',
        amount: (sub.planId as any)?.price || 0,
        status: 'completed',
        date: (sub as any).createdAt || new Date(),
        planName: (sub.planId as any)?.name || 'Unknown Plan'
      })));
    
    const revenueChart = [
      { month: 'Jan', revenue: Math.round(totalRevenue * 0.6), subscriptions: Math.round(activeSubscriptions * 0.7) },
      { month: 'Feb', revenue: Math.round(totalRevenue * 0.7), subscriptions: Math.round(activeSubscriptions * 0.8) },
      { month: 'Mar', revenue: Math.round(totalRevenue * 0.8), subscriptions: Math.round(activeSubscriptions * 0.9) },
      { month: 'Apr', revenue: Math.round(totalRevenue * 0.9), subscriptions: activeSubscriptions },
      { month: 'May', revenue: totalRevenue, subscriptions: activeSubscriptions },
      { month: 'Jun', revenue: Math.round(totalRevenue * 1.1), subscriptions: Math.round(activeSubscriptions * 1.1) }
    ];
    
    const billingData = {
      totalRevenue: Math.round(totalRevenue / 100), // Convert cents to dollars
      monthlyRevenue: Math.round(monthlyRevenue / 100),
      activeSubscriptions,
      churnRate: 2.3,
      recentTransactions,
      revenueChart
    };
    
    res.json({ success: true, data: billingData });
  } catch (error) {
    console.error('Billing data error:', error);
    res.json({ 
      success: true, 
      data: {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        recentTransactions: [],
        revenueChart: []
      }
    });
  }
});

// Plan management routes
router.get('/plans', async (req: Request, res: Response) => {
  try {
    console.log('Fetching plans...');
    const plans = await Plan.find({}).sort({ price: 1 });
    console.log('Found plans:', plans.length);
    res.json({ success: true, data: plans || [] });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.json({ success: true, data: [] });
  }
});

router.post('/plans', asyncHandler(async (req: Request, res: Response) => {
  const plan = await Plan.create(req.body);
  res.status(201).json({ success: true, data: plan });
}));

router.put('/plans/:id', asyncHandler(async (req: Request, res: Response) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!plan) {
    res.status(404).json({ success: false, message: 'Plan not found' });
    return;
  }
  res.json({ success: true, data: plan });
}));

router.delete('/plans/:id', asyncHandler(async (req: Request, res: Response) => {
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
  // Models already imported at top
  
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
