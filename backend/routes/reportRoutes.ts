import { Router } from 'express';
import { 
    generateMonthlyCollectionSheet, 
    getTenantMonthlyStatement, 
    generateTenantProfilePdf,
    exportTenantsAsCsv,
    exportExpensesAsCsv  // Import the new function
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.get('/monthly-collection-sheet', protect, authorize(['Landlord', 'Agent']), generateMonthlyCollectionSheet);
router.get('/tenant-statement/:tenantId', protect, authorize(['Landlord', 'Agent']), getTenantMonthlyStatement);
router.get('/tenant-profile/:tenantId/pdf', protect, authorize(['Landlord', 'Agent']), generateTenantProfilePdf);
router.get('/tenants/export', protect, authorize(['Landlord', 'Agent']), exportTenantsAsCsv);

// --- NEW ROUTE for Expense Bulk Export ---
router.get('/expenses/export', protect, authorize(['Landlord', 'Agent']), exportExpensesAsCsv);

export default router;
