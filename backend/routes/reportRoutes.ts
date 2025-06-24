import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { 
    exportProperties,
    exportTenants,
    generateMonthlyCollectionSheet,
    exportMaintenance
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();
router.use(protect, authorize(['Landlord', 'Agent']));

// Property and Tenant Exports
router.get('/properties/export', asyncHandler(exportProperties));
router.get('/tenants/export', asyncHandler(exportTenants));

// Rent Collection Sheet
router.get('/monthly-collection-sheet', asyncHandler(generateMonthlyCollectionSheet));

// Filterable Exports
router.get('/maintenance/export', asyncHandler(exportMaintenance));
// Note: You would add a similar route for cashflow here

export default router;
