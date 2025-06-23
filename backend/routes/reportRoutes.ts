import { Router } from 'express';
// Import the new function
import { 
    generateMonthlyCollectionSheet, 
    getTenantMonthlyStatement, 
    generateTenantProfilePdf,
    exportTenantsAsCsv 
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.get('/monthly-collection-sheet', /* ... */);
router.get('/tenant-statement/:tenantId', /* ... */);
router.get('/tenant-profile/:tenantId/pdf', /* ... */);

// --- NEW ROUTE for Tenant Bulk Export ---
router.get('/tenants/export', protect, authorize(['Landlord', 'Agent']), exportTenantsAsCsv);

export default router;
