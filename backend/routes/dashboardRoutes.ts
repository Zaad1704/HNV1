import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import {
  getOverviewStats,
  getLateTenants,
  getExpiringLeases,
  getFinancialSummary,
  getOccupancySummary,
  getRentStatus,       
  getRecentActivity,   
} from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = express.Router();

// Public route for landing stats
router.get('/landing-stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    const totalProperties = await Property.countDocuments({});
    const totalUsers = await Tenant.countDocuments({});
    const countriesServed = 25;
    
    res.status(200).json({
      success: true,
      data: {
        totalProperties,
        totalUsers,
        countriesServed
      }
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      data: {
        totalProperties: 2500,
        totalUsers: 5000,
        countriesServed: 25
      }
    });
  }
}));

// Protected routes
router.use(protect, authorize(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));

router.get('/overview-stats', asyncHandler(getOverviewStats));
router.get('/late-tenants', asyncHandler(getLateTenants));
router.get('/expiring-leases', asyncHandler(getExpiringLeases));
router.get('/financial-summary', asyncHandler(getFinancialSummary));
router.get('/occupancy-summary', asyncHandler(getOccupancySummary));

// --- NEW ROUTES FOR OVERVIEW WIDGETS ---
router.get('/rent-status', asyncHandler(getRentStatus));
router.get('/recent-activity', asyncHandler(getRecentActivity));



export default router;
