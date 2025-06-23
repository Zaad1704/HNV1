import { Router } from 'express';
import { generateMonthlyCollectionSheet, getTenantMonthlyStatement, generateTenantProfilePdf } from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.get('/monthly-collection-sheet', protect, authorize(['Landlord', 'Agent']), generateMonthlyCollectionSheet);
router.get('/tenant-statement/:tenantId', protect, authorize(['Landlord', 'Agent']), getTenantMonthlyStatement);

// --- NEW ROUTE for Tenant Profile PDF Download ---
router.get('/tenant-profile/:tenantId/pdf', protect, authorize(['Landlord', 'Agent']), generateTenantProfilePdf);

export default router;
