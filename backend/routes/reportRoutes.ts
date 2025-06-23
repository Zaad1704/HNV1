import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { 
    generateMonthlyCollectionSheet, 
    getTenantMonthlyStatement, 
    generateTenantProfilePdf,
    exportTenantsAsCsv,
    exportExpensesAsCsv 
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.get('/monthly-collection-sheet', protect, authorize(['Landlord', 'Agent']), asyncHandler(generateMonthlyCollectionSheet));
router.get('/tenant-statement/:tenantId', protect, authorize(['Landlord', 'Agent']), asyncHandler(getTenantMonthlyStatement));
router.get('/tenant-profile/:tenantId/pdf', protect, authorize(['Landlord', 'Agent']), asyncHandler(generateTenantProfilePdf));
router.get('/tenants/export', protect, authorize(['Landlord', 'Agent']), asyncHandler(exportTenantsAsCsv));

// --- NEW ROUTE for Expense Bulk Export ---
router.get('/expenses/export', protect, authorize(['Landlord', 'Agent']), asyncHandler(exportExpensesAsCsv));

export default router;
