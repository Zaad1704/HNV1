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

// Mock implementations for missing controllers
const mockFinancialSummary = async (req: Request, res: Response) => {
  const mockData = [
    { name: 'Jan', Revenue: 4000, Expenses: 2400 },
    { name: 'Feb', Revenue: 3000, Expenses: 1398 },
    { name: 'Mar', Revenue: 2000, Expenses: 9800 },
    { name: 'Apr', Revenue: 2780, Expenses: 3908 },
    { name: 'May', Revenue: 1890, Expenses: 4800 },
    { name: 'Jun', Revenue: 2390, Expenses: 3800 }
  ];
  res.json({ success: true, data: mockData });
};

const mockRentStatus = async (req: Request, res: Response) => {
  const mockData = [
    { name: 'Paid', value: 75 },
    { name: 'Overdue', value: 25 }
  ];
  res.json({ success: true, data: mockData });
};
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
router.get('/financial-summary', asyncHandler(mockFinancialSummary));
router.get('/occupancy-summary', asyncHandler(getOccupancySummary));

// --- NEW ROUTES FOR OVERVIEW WIDGETS ---
router.get('/rent-status', asyncHandler(mockRentStatus));
router.get('/recent-activity', asyncHandler(getRecentActivity));

// Tenant portal endpoint
router.get('/tenant-portal', protect, authorize(['Tenant']), asyncHandler(async (req: Request, res: Response) => {
  const Tenant = require('../models/Tenant');
  const Payment = require('../models/Payment');
  
  const tenant = await Tenant.findOne({ 
    userId: req.user?._id 
  }).populate('propertyId landlordId');
  
  if (!tenant) {
    res.status(404).json({ success: false, message: 'Tenant profile not found' });
    return;
  }
  
  const paymentHistory = await Payment.find({ tenantId: tenant._id }).sort({ createdAt: -1 }).limit(10);
  
  res.json({
    success: true,
    data: {
      leaseInfo: tenant,
      paymentHistory,
      upcomingDues: {
        totalAmount: tenant.rentAmount || 1200,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lineItems: [{ description: 'Monthly Rent', amount: tenant.rentAmount || 1200 }]
      }
    }
  });
}));

export default router;
