import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { 
    generateMonthlyCollectionSheet, 
    getTenantMonthlyStatement, 
    generateTenantProfilePdf,
    exportTenants,
    exportExpenses 
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// This route now handles both CSV and PDF export for tenants
router.get('/tenants/export', protect, authorize(['Landlord', 'Agent']), asyncHandler(exportTenants));

// This route now handles both CSV and PDF export for expenses
router.get('/expenses/export', protect, authorize(['Landlord', 'Agent']), asyncHandler(exportExpenses));

// Other report routes remain unchanged
router.get('/monthly-collection-sheet', protect, authorize(['Landlord', 'Agent']), asyncHandler(generateMonthlyCollectionSheet));
router.get('/tenant-statement/:tenantId', protect, authorize(['Landlord', 'Agent']), asyncHandler(getTenantMonthlyStatement));
router.get('/tenant-profile/:tenantId/pdf', protect, authorize(['Landlord', 'Agent']), asyncHandler(generateTenantProfilePdf));

export default router;
