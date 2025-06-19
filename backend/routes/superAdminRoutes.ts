import { Router } from 'express';
import { 
    getDashboardStats, 
    getAllOrganizations, 
    updateOrganizationStatus,
    getPlatformGrowthData,
    getPlanDistributionData,
    getAllUsers,
    getBillingData // Import the new function
} from '../controllers/superAdminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This middleware protects all subsequent routes in this file for Super Admins only
router.use(protect, authorize('Super Admin'));

// Routes for dashboard data
router.get('/dashboard-stats', getDashboardStats);
router.get('/platform-growth', getPlatformGrowthData);
router.get('/plan-distribution', getPlanDistributionData);

// Routes for managing organizations
router.get('/organizations', getAllOrganizations);
router.put('/organizations/:id/status', updateOrganizationStatus);

// Add the new route for getting all users
router.get('/users', getAllUsers);

// Add the new route for getting all billing info
router.get('/billing', getBillingData);


export default router;
