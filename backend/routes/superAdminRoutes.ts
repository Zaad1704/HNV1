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
router.delete('/organizations/:orgId', asyncHandler(deleteOrganization)); // New Route

router.put('/organizations/:orgId/subscription', asyncHandler(updateOrganizationSubscription)); 
router.put('/organizations/:orgId/toggle-self-deletion', asyncHandler(toggleSelfDeletion)); 

router.get('/users', asyncHandler(getAllUsers));
router.put('/users/:userId/manage', asyncHandler(updateUserByAdmin));
router.delete('/users/:userId', asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
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

router.get('/all-maintenance-requests', asyncHandler(getAllMaintenanceRequests));

export default router;
